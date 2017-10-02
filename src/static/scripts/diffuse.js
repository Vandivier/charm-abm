/*
design: I have 3 kinds of stationary non-agent turtles: homes, schools, and jobs.
then, there are turtle turtles who represent people.
depending on turtle prefs, they will max utility possibly by going to school or nah, job or nah, etc.
need sugarscape-like eat or die; lifespan. maybe later procreate w generations
//ref for breeds: https://github.com/backspaces/asx/blob/38d3e2bd945cdfdeed367ba587533f23cfba13c9/docs/models/scripts/fire.js

//ref for pathfinding home:
https://github.com/backspaces/asx/blob/38d3e2bd945cdfdeed367ba587533f23cfba13c9/docs/models/scripts/exit.js
*/

class DiffuseModel extends AS.Model {
    setup() {
        // model config
        this.patchBreeds('homes jobs schools uninterestings')
        this.turtleBreeds('bros gals')
        this.population = 100
        this.radius = 2

        this.turtles.setDefault('shape', 'triangle')
        this.bros.setDefault('shape', 'triangle')
        this.gals.setDefault('shape', 'triangle')

        this.cmap = AS.ColorMap.Rgb256
        this.iHighlightColor = .51;
        this.iTickoutLimit = 40;

        // patch config
        this.patches.own('ran ds') // arbitray agent property names
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
            var sBreed = (AS.util.randomFloat(1.0) < .5) ? 'bros' : 'gals';

            //patch.sprout(1, this[sBreed], turtle => {
            patch.sprout(1, this.turtles, turtle => {
                //debugger  // TODO: why this never hits for this[sBreed] ?
                turtle.patch.setBreed(this.homes)
            })
        })

        this.uninterestings.ask(uninteresting => {
            identifyPatchType(uninteresting, this);
        })

        // turtle === agent config
        this.turtles.setDefault('speed', 0.3)
        this.turtles.setDefault('size', 1)
        this.turtles.setDefault('age', AS.util.randomInt(76)) // US national med age ~ 38
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
            turtle.theta += AS.util.randomCentered(0.1)
            turtle.forward(turtle.speed)

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

const options = AS.Model.defaultWorld(2, 50)
options.minX = 2 * options.minX
options.maxX = 2 * options.maxY
const model = new DiffuseModel(document.body, options)
model.setup()
model.start()

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

/* TODO: move code below to app.js. here for convenience only. */

// TODO: on keydown, not click, this is super annoying
var MouseControl = function () {
    this.stopped = false;
};

window.onclick = function () {
    if (model.anim.stopped) {
        model.anim.start()
    } else {
        model.anim.stop()
    }
}
