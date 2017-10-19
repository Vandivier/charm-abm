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

angles
//  ref: https://evanw.github.io/lightgl.js/docs/vector.html
//  ref: http://victorjs.org/

notes:
model.reset() doesn't seem to work as expected. model.setup() resets the data state but not camera angle
a tick in this model is supposed to represent an hour

// TODO: parallel. possibly via Node workers, webworkers, or https://github.com/Microsoft/napajs

*/

const constants = {
    arrsFirstNames: ['John', 'Mike', 'Katie', 'Jessie', 'David', 'Cheryl', 'Tina', 'Todd', 'Jimmy', 'Owen', 'Connor'],
    arrsLastNames: ['Neutron', 'Johns', 'Trump', 'Obama', 'Axtell', 'Densmore', 'Frost', 'Jones'],
    iAverageAge: 38, // median us age
    iAgeStandardDeviation: 10, //totally made up
    iGeneric: 2.5,  // arbitrary normal targeted at a human-watcheable speed
    iGenericStandardDeviation: .5,
    iPercentPatchesWithJob: .1,
    iPercentPatchesWithSchool: .01
}

class DiffuseModel extends AS.Model {
    setup() {
        // model config
        this.population = 1
        this.radius = 2

        this.turtles.setDefault('shape', 'circle')

        this.cmap = AS.ColorMap.Rgb256;
        this.iHighlightColor = .51;
        this.iPathColorTickLimit = 40;

        // patch config
        this.patches.ask(patch => {
            patch.iPathColorTicks = 0
            patch.iOriginalColor = AS.util.randomFloat(1.0)
            patch.iPathColor = patch.iOriginalColor
            patch.model = this;

            if (AS.util.randomFloat(1.0) < constants.iPercentPatchesWithJob) {
                patch.jobData = {};
                AS.util.assignNormals(patch.jobData,
                                      ['reputation',
                                      'wages',
                                      'educatedBonusWages'],
                                      constants.iGeneric,
                                      constants.iGenericStandardDeviation);
            }

            if (AS.util.randomFloat(1.0) < constants.iPercentPatchesWithSchool) {
                patch.schoolData = {};
                AS.util.assignNormals(patch.schoolData,
                                      ['reputation',
                                      'price'],
                                      constants.iGeneric,
                                      constants.iGenericStandardDeviation);
            }
        })

        // randomly select patches to spawn ('sprout') agents === turtles
        // TODO: a better model would have an increased chance of a person spawning next to another person rather than an even distribution of starting anywhere, or allow 1 patch to be home of multiple people (random draw w replacement, maybe it's doing so)
        this.patches.nOf(this.population).ask(patch => {
            patch.sprout(1, this.turtles, turtle => {
                fInitTurtle(turtle, {
                    'model': this,
                    'patch': patch
                })
            })
        })

        // turtle config
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

            turtle.iLifetimeUtility += turtle.iUtilityPerTick;

            this.patches.inRadius(turtle.patch, this.radius, true).ask(patch => {
                patch.iPathColor = this.iHighlightColor;
            })

        })

        // reset back to iOriginalColor after 5 ticks
        this.patches.ask(patch => {
            if (patch.iPathColor !== patch.iOriginalColor) {
                patch.iPathColorTicks++

                if (patch.iPathColorTicks === this.iPathColorTickLimit) {
                    patch.iPathColor = patch.iOriginalColor;
                    patch.iPathColorTicks = 0;
                }
            }
        })

        this.patches.diffuse('iPathColor', 0, this.cmap) // TODO: some other way to do this? I don't need diffuse.
    }
}

module.exports = DiffuseModel;

//  TODO: diminishing marginal utility of consumption, and consumption by kind
//          also maybe go some place to consume. right now they consume anywhere
//  TODO: make productivity multi-specific; right now it's used both for search and MLP / wage outcomes
//  TODO: skew age.
//  TODO: may want to ensure turtles don't have 0 values, but odds = 0
function fInitTurtle(turtle, oData) {
    const arrsNormals = ['money', 'productivity'];
    const arrsFlooredNormals = ['consumptionUtility', 'leisureUtility', 'speed', 'timePreference'];

    AS.util.assignNormals(turtle, arrsNormals, constants.iGeneric, constants.iGenericStandardDeviation);
    AS.util.assignFlooredNormals(turtle, arrsFlooredNormals, constants.iGeneric, constants.iGenericStandardDeviation);

    turtle.age = AS.util.randomNormal(constants.iAverageAge, constants.iAgeStandardDeviation);
    turtle.curiosity = AS.util.randomFloat(1.0); // probability to consider school or a new job
    turtle.iUtilityPerTick = turtle.leisureUtility; // by default turtle is leisurely at home
    turtle.home = oData.patch;
    turtle.patchPreferredDestination = turtle.home; // default to leisure before considering alternatives
    turtle.model = oData.model;
    turtle.name = AS.util.randomFromArray(constants.arrsFirstNames) + ' ' + AS.util.randomFromArray(constants.arrsLastNames);
}

// the agent/turtle isn't assumed to want to move anywhere
// in fact, chilling at home provides utility.
// so let em decide where to go here.
//
// by default the individual prefers to continue doing whatever they are currently doing
//
// TODO: effort parameter multiplied by speed. bc they could get utility by providing submax effort.
// TODO: given current location and target location, return theta.
//  ref: model.turtles.inPatchRect()
function fGetDesiredMovement(turtle) {
    let arrJobs = turtle.model.patches.filter(function(patch){ return patch.jobData });
    let arrSchools = turtle.model.patches.filter(function(patch){ return patch.schoolData });
    let oJobToConsider = AS.util.randomFromArray(arrJobs);
    let oSchoolToConsider = AS.util.randomFromArray(arrSchools);

    if (turtle.iUtilityPerTick < turtle.leisureUtility) { // always consider going home
        turtle.patchPreferredDestination = turtle.home;
        turtle.iUtilityPerTick = turtle.leisureUtility;
    }

    // TODO: different path color when moving to school vs work vs home
    if (AS.util.randomFloat(1.0) < turtle.curiosity) { // search for other utility sources like school or a job
        //console.log(oJobToConsider, oSchoolToConsider);
    }

    if (turtle.patchPreferredDestination.id !== turtle.patch.id) { // agent wants to move
        AS.util.faceCenter(turtle, turtle.patchPreferredDestination);
        turtle.forward(turtle.speed);
    }
}
