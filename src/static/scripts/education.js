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
TODO: multiple people can't have the same job
TODO: why is no one getting educated...?
TODO: perf. Now I get 5 fps with 20 agents
TODO: parallel computation

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

// TODO: perf: use patch.typedColor instead of .setColor/.getColor()

// Chrome 32 bit is limitted to 3 gb per process ram https://www.reddit.com/r/chrome/comments/2rcx22/is_there_a_way_to_allocate_more_ram_for_google/
*/

const constants = {
    arrsFirstNames: ['John', 'Mike', 'Katie', 'Jessie', 'David', 'Cheryl', 'Tina', 'Todd', 'Jimmy', 'Owen', 'Connor'],
    arrsLastNames: ['Neutron', 'Johns', 'Trump', 'Obama', 'Axtell', 'Densmore', 'Frost', 'Jones'],
    iAverageAge: 38, // median us age
    iAgeStandardDeviation: 10, //totally made up
    iAverageSpeed: 2.5,  // arbitrary normal targeted at a human-watcheable speed
    iPercentPatchesWithJob: .1,
    iPercentPatchesWithSchool: .01,
    iTicksToBecomeEducated: 60, // suppose it's months and 5 years is the average.
    iHighlightToHome: AS.Color.color(200, 0, 0), // red
    iHighlightToSchool: AS.Color.color(0, 200, 0), // green
    iHighlightToWork: AS.Color.color(0, 0, 200), // blue
    iTurtleHighlightWidth: 2,
    iTurtleSize: 1,
    iPopulation: 1, // currently, pop = 10 gets ~ 2-3 fps
    iSteadyTickLimit: 2500,
    iTrials: 1,
    iPathColorTickLimit: 40,
    sTurtleShape: 'circle'
}

class EducationModel extends AS.Model {
    setup() {
        // model config
        this.iSteadyTicks = 0;
        this.population = constants.iPopulation; 
        this.turtles.setDefault('shape', constants.sTurtleShape);
        this.cmap = AS.ColorMap.Rgb256;

        // patch config
        // patch reputation really represent all nonpecuniary benefits including reputation
        this.patches.ask(patch => {
            patch.model = this;
            patch.iPathColorTicks = 0;
            patch.iOriginalColor = AS.Color.randomColor();

            patch.setColor(patch.iOriginalColor);
            if (AS.util.randomFloat(1.0) < constants.iPercentPatchesWithJob) {
                patch.jobData = {};
                patch.jobData['wages'] = AS.util.randomNormalFloored();
                AS.util.assignNormals(patch.jobData,
                                      ['educatedBonusWages',
                                       'reputation']);
            }

            if (AS.util.randomFloat(1.0) < constants.iPercentPatchesWithSchool) {
                patch.schoolData = {};
                patch.schoolData['price'] = AS.util.randomNormalFloored();
                // TODO use critical policy factor iFlooredSchoolPrice; theory that it slows economic growth, natural floor at 0 almost every time, but sometimes not esp when schools are few; can regress those params
                AS.util.assignNormals(patch.schoolData,
                                      ['reputation',
                                       'suffering']);
            }
        })

        this.patches.filter(function (patch) {
                return patch.jobData
            })
            .map((patchWithJob, i) => {
                patchWithJob.jobData.jobId = i; // use index as unique id
            })

        this.patches.filter(function (patch) {
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
        this.turtles.setDefault('size',  constants.iTurtleSize)
    }

    // TODO: aging and dying agents, collect statistics
    step() {
        if (fEndTrial(this)) {
            fCollectStatistics(this);

            this.done = true // TODO: restart and run until n trials collected. OR USE WEB WORKERS IN PARALLEL W GPU ACCELERATION WOOT
            return // keep three control running
        }

        this.turtles.ask((turtle) => {
            if (Number.isInteger(turtle.iTicksInSchool)) {
                fGetEducated(turtle);
            }
            else { // TODO: bad business rule: exclusivity of fGetEducated vs fGetDesiredMovement
                fGetDesiredMovement(turtle);
            }

            turtle.iLifetimeUtility += turtle.iUtilityPerTick;

            this.patches.inRadius(turtle.patch, constants.iTurtleHighlightWidth, true)
                .ask(patch => {
                    patch.setColor(turtle.iActiveHighlight);
                    patch.iPathColorTicks = 1;
                });
        });

        // reset back to iOriginalColor after some ticks
        this.patches
            .filter(function (patch) {
                return patch.iPathColorTicks;
            })
            .ask(patch => {
                patch.iPathColorTicks++;
                if (patch.iPathColorTicks === constants.iPathColorTickLimit) {
                    patch.setColor(patch.iOriginalColor);
                    patch.iPathColorTicks = 0;
                }
            });
    }
}

module.exports = EducationModel;

//  TODO: diminishing marginal utility of consumption, and consumption by kind
//          also maybe go some place to consume. right now they consume anywhere
//  TODO: make productivity multi-specific; right now it's used both for search and MLP / wage outcomes
//  TODO: skew age.
//  TODO: may want to ensure turtles don't have 0 values, but odds = 0
//  TODO: should we consider an energy-oriented approach to action? Where the person has and spends energy on work and other tasks like search.
//  TODO: these values are roughly linear but maybe shouldn't be; eg real time preference may not be a linear discount factor
function fInitTurtle(turtle, oData) {
    const arrsNormals = ['money', 'productivity'];
    const arrsFlooredNormals = ['consumptionUtility', 'leisureUtility', 'timePreference'];

    AS.util.assignNormals(turtle,
                          arrsNormals);
    AS.util.assignFlooredNormals(turtle,
                                 arrsFlooredNormals);

    turtle.age = AS.util.randomNormal(constants.iAverageAge, constants.iAgeStandardDeviation);
    turtle.curiosity = AS.util.randomFloat(1.0); // probability to consider school or a new job
    turtle.iLifetimeUtility = 0;
    turtle.home = oData.patch;
    turtle.model = oData.model;
    turtle.name = AS.util.randomFromArray(constants.arrsFirstNames) + ' ' + AS.util.randomFromArray(constants.arrsLastNames);
    turtle.speed = AS.util.randomNormalFloored(constants.iAverageSpeed);

    // by default turtle is leisurely at home
    turtle.iActiveHighlight = constants.iHighlightToHome;
    turtle.iUtilityPerTick = turtle.leisureUtility;
    turtle.patchPreferredDestination = turtle.home;
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
    let patchSchoolToConsider = AS.util.randomFromArray(arrSchools);
    let iDistanceRemaining;
    let iProspectiveWages = patchJobToConsider.jobData.wages
                            + patchJobToConsider.jobData.reputation;

    if (turtle.iUtilityPerTick < turtle.leisureUtility) { // always consider going home
        turtle.patchPreferredDestination = turtle.home;
        turtle.iActiveHighlight = constants.iHighlightToHome;
        turtle.iUtilityPerTick = turtle.leisureUtility;
    }

    // TODO: different path color when moving to school vs work vs home
    if (AS.util.randomFloat(1.0) < turtle.curiosity) { // search for other utility sources like school or a job. TODO: justify check order
        if (turtle.isEducated) {
            iProspectiveWages += patchJobToConsider.jobData.educatedBonusWages;
        }

        if (turtle.iUtilityPerTick < iProspectiveWages) { // TODO: switching costs, reputation, so many other things
            turtle.job = patchJobToConsider.jobData;
            turtle.patchPreferredDestination = patchJobToConsider;
            turtle.iActiveHighlight = constants.iHighlightToWork;
            turtle.iUtilityPerTick = iProspectiveWages;
        }

        fConsiderGoingToSchool(turtle, patchSchoolToConsider);
    }

    if (turtle.patchPreferredDestination.id !== turtle.patch.id) { // agent wants to move
        AS.util.approach(turtle, turtle.patchPreferredDestination);
        turtle.bMoving = true;
    } else {
        turtle.bMoving = false;
    }
}

// turtle needn't physically go to school
// if they work and school, will physically go to work
// same for home/leisure
function fGetEducated(turtle) {
    turtle.iLifetimeUtility -= turtle.school.suffering;
    turtle.iTicksInSchool++;

    if (turtle.iTicksInSchool === constants.iTicksToBecomeEducated) {
        turtle.isEducated = true;
        delete turtle.iTicksInSchool;
    }
}

// TODO: in the real world, unemployed folks go to school too. Also, comparing price to wages this way is not an economically valid business rule (need future payoffs). Also, consider school rep and the possibility of school transfers. Also, loans instead of cash.
function fConsiderGoingToSchool(turtle, patchSchoolToConsider) {
    if (!turtle.isEducated &&
        turtle.job &&
        patchSchoolToConsider.schoolData.price < turtle.job.educatedBonusWages &&
        turtle.money > patchSchoolToConsider.schoolData.price) {
        turtle.money -= patchSchoolToConsider.schoolData.price;
        turtle.school = patchSchoolToConsider.schoolData;
        turtle.patchPreferredDestination = patchSchoolToConsider;
        turtle.iActiveHighlight = constants.iHighlightToSchool;
        turtle.iTicksInSchool = 0;
    }
}

// TODO: this rule isn't great, but how bad is it?
function fEndTrial(_model) {
    let iMovingTurtles = _model.turtles.filter(function(oTurtle){
        return oTurtle.bMoving;
    }).length;

    if (!iMovingTurtles) {
        _model.iSteadyTicks++;
    } else {
        _model.iSteadyTicks = 0;
    }

    return (_model.iSteadyTicks === constants.iSteadyTickLimit);
}

// report constants
// then report key vars and calc average and SD
// then execute selected regressions
//
// for each factor, get average and SD
// then, do specified regressions
// then, report all constants including higher order constants
//
// TODO: this is the role of a server process; we don't need a GUI
// so, flatten model and POST (can't JSON.stringify circular)
function fCollectStatistics() {
    //school factors
    //job factors
    //turtle factors
    //count, leisurevalue, wages, isEducated, money, curiosity, utility

    //regression 1
    //regression 2
    //regression 3

    console.log('trial complete');
}
