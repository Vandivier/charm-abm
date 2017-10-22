/*
design: I have 3 kinds of stationary non-agent turtles: homes, schools, and jobs.
then, there are turtle turtles who represent people.
depending on turtle prefs, they will max utility possibly by going to school or nah, job or nah, etc.
need sugarscape-like eat or die; lifespan. maybe later procreate w generations
//ref for breeds: https://github.com/backspaces/asx/blob/38d3e2bd945cdfdeed367ba587533f23cfba13c9/docs/models/scripts/fire.js

//ref for pathfinding home:
https://github.com/backspaces/asx/blob/38d3e2bd945cdfdeed367ba587533f23cfba13c9/docs/models/scripts/exit.js

TODO: pass constants from app.js
TODO: definition of equilibrium (I think whole economy growth rate works. or everyone dies or no one getting educated)
TODO: collect statistics and identify relationship of interest. I think factors of getting educated is interesting.

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

// TODO: better use of work and school reputation
*/

const constants = {
    arrsFirstNames: ['John', 'Mike', 'Katie', 'Jessie', 'David', 'Cheryl', 'Tina', 'Todd', 'Jimmy', 'Owen', 'Connor'],
    arrsLastNames: ['Neutron', 'Johns', 'Trump', 'Obama', 'Axtell', 'Densmore', 'Frost', 'Jones'],
    iAverageAge: 38, // median us age
    iAgeStandardDeviation: 10, //totally made up
    iGeneric: 2.5,  // arbitrary normal targeted at a human-watcheable speed
    iGenericStandardDeviation: .5,
    iPercentPatchesWithJob: .1,
    iPercentPatchesWithSchool: .01,
    iTicksToBecomeEducated: 60 // suppose it's months and 5 years is the average.
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
                                      ['educatedBonusWages',
                                       'reputation', // really, represents all nonpecuniary benefits including reputation
                                       'wages'],
                                      constants.iGeneric,
                                      constants.iGenericStandardDeviation);
            }

            if (AS.util.randomFloat(1.0) < constants.iPercentPatchesWithSchool) {
                patch.schoolData = {};
                AS.util.assignNormals(patch.schoolData,
                                      ['price',
                                       'reputation',
                                       'suffering'],
                                      constants.iGeneric,
                                      constants.iGenericStandardDeviation);
            }
        })

        this.patches.filter(function(patch){
                return patch.jobData
        })
        .map((patchWithJob, i) => {
            patchWithJob.jobData.jobId = i; // use index as unique id
        })

        this.patches.filter(function(patch){
                return patch.schoolData
        })
        .map((patchWithSchool, i) => {
            patchWithSchool.schoolData.schoolId = i; // use index as unique id
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
            if (Number.isInteger(turtle.iTicksInSchool)) {
                fGetEducated(turtle);
            }
            else { // TODO: bad business rule: exclusivity of fGetEducated vs fGetDesiredMovement
                fGetDesiredMovement(turtle);
            }

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
//  TODO: should we consider an energy-oriented approach to action? Where the person has and spends energy on work and other tasks like search.
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
// TODO: individual memory (sccum / decum) of work and school. In particular: average wages w and without education in order to provide for getting an education even if unemployed
//  ref: model.turtles.inPatchRect()
function fGetDesiredMovement(turtle) {
    let arrJobs = turtle.model.patches.filter(function(patch){ return patch.jobData });
    let arrSchools = turtle.model.patches.filter(function(patch){ return patch.schoolData });
    let patchJobToConsider = AS.util.randomFromArray(arrJobs);
    let oSchoolToConsider = AS.util.randomFromArray(arrSchools);
    let iProspectiveWages = patchJobToConsider.jobData.wages
                            + patchJobToConsider.jobData.reputation;

    if (turtle.iUtilityPerTick < turtle.leisureUtility) { // always consider going home
        turtle.patchPreferredDestination = turtle.home;
        turtle.iUtilityPerTick = turtle.leisureUtility;
    }

    // TODO: different path color when moving to school vs work vs home
    if (AS.util.randomFloat(1.0) < turtle.curiosity) { // search for other utility sources like school or a job
        if (turtle.isEducated) {
            iProspectiveWages += patchJobToConsider.jobData.educatedBonusWages;
        }

        if (turtle.iUtilityPerTick < iProspectiveWages) { // TODO: switching costs, reputation, so many other things
            turtle.patchPreferredDestination = patchJobToConsider;
            turtle.job = patchJobToConsider.jobData;
            turtle.iUtilityPerTick = iProspectiveWages;
        }

        if (!turtle.isEducated
            && turtle.job
            && turtle.school
            && oSchoolToConsider.price < patchJobToConsider.jobData.educatedBonusWages
            && turtle.money > oSchoolToConsider.price)
        { // TODO: in the real world, unemployed folks go to school too. Also, comparing price to wages this way is not an economically valid business rule (need future payoffs). Also, consider school rep and the possibility of school transfers. Also, loans instead of cash.
            turtle.money -= oSchoolToConsider.price;
            turtle.school = oSchoolToConsider.schoolData;
            turtle.patchPreferredDestination = oSchoolToConsider;
            turtle.iTicksInSchool = 0;
        }
    }

    if (turtle.patchPreferredDestination.id !== turtle.patch.id) { // agent wants to move
        AS.util.faceCenter(turtle, turtle.patchPreferredDestination);
        turtle.forward(turtle.speed);
    }
}

function fGetEducated(turtle) {
    turtle.iLifetimeUtility -= turtle.school.suffering;
    turtle.iTicksInSchool++;

    if (turtle.iTicksInSchool === constants.iTicksToBecomeEducated) {
        turtle.isEducated = true;
        delete turtle.iTicksInSchool;
    }
}
