/*
design: I have 3 kinds of stationary non-agent turtles: homes, schools, and jobs.
then, there are turtle turtles who represent people.
depending on turtle prefs, they will max utility possibly by going to school or nah, job or nah, etc.
need sugarscape-like eat or die; lifespan. maybe later procreate w generations
//ref for breeds: https://github.com/backspaces/asx/blob/38d3e2bd945cdfdeed367ba587533f23cfba13c9/docs/models/scripts/fire.js

//ref for pathfinding home:
https://github.com/backspaces/asx/blob/38d3e2bd945cdfdeed367ba587533f23cfba13c9/docs/models/scripts/exit.js

TODO: pass constants from app.js

//  TODO: utils.randomFromDistrobution() and utils.randomSkewed(); eg for age
//  ref: https://www.npmjs.com/package/skew-normal-random
//  abstract derivatives?? ref: http://mathjs.org/
//  ref: https://github.com/errcw/gaussian
//  ref: https://www.che.utah.edu/~tony/course/material/Statistics/all_funcs.php
//  ref: http://www.ollysco.de/2012/04/gaussian-normal-functions-in-javascript.html
//  ref: https://simplestatistics.org/
//  ref: https://github.com/jstat/jstat
//  ref: http://www.statisticsblog.com/2015/10/random-samples-in-js-using-r-functions/
//  ref: https://github.com/Mattasher/probability-distributions/blob/master/index.js

notes:
model.reset() doesn't seem to work as expected. model.setup() resets the data state but not camera angle
a tick in this model is supposed to represent an hour

*/

const constants = {
    arrsFirstNames: ['John', 'Mike', 'Katie', 'Jessie', 'David', 'Cheryl', 'Tina', 'Todd', 'Jimmy', 'Owen', 'Connor'],
    arrsLastNames: ['Neutron', 'Johns', 'Trump', 'Obama', 'Axtell', 'Densmore', 'Frost'],
    iAverageAge: 38, // median us age
    iAgeStandardDeviation: 10, //totally made up
    iGeneric: 2.5,  // arbitrary normal targeted at a human-watcheable speed
    iGenericStandardDeviation: .5
}

class DiffuseModel extends AS.Model {
    setup() {
        // model config
        this.patchBreeds('homes jobs schools uninterestings')
        this.population = 1
        this.radius = 2

        this.turtles.setDefault('shape', 'triangle')

        this.cmap = AS.ColorMap.Rgb256
        this.iHighlightColor = .51;
        this.iTickoutLimit = 40;

        // patch config
        this.patches.own('ran ds') // arbitray agent property names
        //this.turtles.setDefault('breed', this.uninterestings)
        this.patches.ask(p => {
            p.setBreed(this.uninterestings)
        })
        this.patches.ask(patch => {
            patch.ds = 0
            patch.tickOutAgentWalk = 0
            patch.originalColor = AS.util.randomFloat(1.0)
            patch.ran = patch.originalColor
        })
        // randomly select patches to spawn ('sprout') agents === turtles
        // TODO: a better model would have an increased chance of a person spawning next to another person rather than an even distribution of starting anywhere
        this.patches.nOf(this.population).ask(patch => {
            patch.sprout(1, this.turtles, turtle => {
                fInitTurtle(turtle, {
                    patch: patch
                })
            })
        })
        this.uninterestings.ask(uninteresting => {
            identifyPatchType(uninteresting, this);
        })

        // turtle config === agent config
        this.turtles.setDefault('size', 1)
    }

    // TODO: aging and dying agents
    step() {
        /*
        if (this.done) return

        if (!this.bros.length
           && !this.gals.length) {
            console.log('Done:', this.anim.toString())
            const iTicksSurvived = this.burnedTrees / this.initialTrees * 100
            console.log('Ticks survived', iTicksSurvived)

            // TODO: stats on properties of population eg age distrobution, min/max, correlate survival to properties.

            this.done = true
            return // keep three control running
        }
        */

        this.turtles.ask((turtle) => {
            fGetDesiredMovement(turtle);

            this.patches.inRadius(turtle.patch, this.radius, true).ask(patch => {
                patch.ran = this.iHighlightColor;
            })

        })

        // reset back to originalColor after 5 ticks
        this.patches.ask(patch => {
            if (patch.ran !== patch.originalColor) {
                patch.tickOutAgentWalk++

                if (patch.tickOutAgentWalk === this.iTickoutLimit) {
                    patch.ran = patch.originalColor;
                    patch.tickOutAgentWalk = 0;
                }
            }
        })

        this.patches.diffuse('ran', 0, this.cmap) // TODO: some other way to do this? I don't need diffuse.
    }
}

module.exports = DiffuseModel;

// in order by regression theorem; following settler history
// buildHomes
// buildJobs
// buildSchools
// logic problem: currently a patch must be one class or another, not multiple
// eg a patch cannot be a workplace and a home or school.
// TODO: schools and jobs more likely to exist when neighboring a home
function identifyPatchType(patch, _model) {
    const iDensity = 92.5;

    if (AS.util.randomInt(100) < iDensity) {
        patch.setBreed(_model.jobs)
    }
    else if (AS.util.randomInt(100) < iDensity) {
        patch.setBreed(_model.schools)
    }
}

//  TODO: diminishing marginal utility of consumption, and consumption by kind
//          also maybe go some place to consume. right now they consume anywhere
//  TODO: make productivity multi-specific; right now it's used both for search and MLP / wage outcomes
//  TODO: skew age.
//  TODO: may want to ensure turtles don't have 0 values, but odds = 0
function fInitTurtle(turtle, oData) {
    const arrsNormals = ['money', 'productivity'];
    const arrsFlooredNormals = ['consumptionUtility', 'leisureUtility', 'speed'];

    AS.util.assignNormals(turtle, arrsNormals, constants.iGeneric, constants.iGenericStandardDeviation);
    AS.util.assignFlooredNormals(turtle, arrsFlooredNormals, constants.iGeneric, constants.iGenericStandardDeviation);

    turtle.age = AS.util.randomNormal(constants.iAverageAge, constants.iAgeStandardDeviation);
    turtle.home = oData.patch;
    turtle.name = AS.util.randomFromArray(constants.arrsFirstNames) + ' ' + AS.util.randomFromArray(constants.arrsLastNames);
}

// the agent/turtle isn't assumed to want to move anywhere
// in fact, chilling at home provides utility.
// so let em decide where to go here.
//
// TODO: effort parameter multiplied by speed. bc they could get utility by providing submax effort.
// TODO: given current location and target location, return theta.
//  ref: model.turtles.inPatchRect()
function fGetDesiredMovement(turtle) {
    let patchPreferredDestination = turtle.home;
    let patchCurrentLocation = turtle.patch;
    let bWantsToMove = (patchPreferredDestination.id !== patchCurrentLocation.id);

    turtle.theta = 0;
    turtle.forward(bWantsToMove ? turtle.speed: 0);
}
