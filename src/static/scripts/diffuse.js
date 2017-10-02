/*
design: I have 3 kinds of stationary non-agent turtles: homes, schools, and jobs.
then, there are turtle turtles who represent people.
depending on turtle prefs, they will max utility possibly by going to school or nah, job or nah, etc.
need sugarscape-like eat or die; lifespan. maybe later procreate w generations
*/

class DiffuseModel extends AS.Model {
  setup () {
    this.patches.own('ran ds')
    this.turtles.setDefault('speed', 0.3)
    this.turtles.setDefault('size', 1)
    this.population = 10
    this.radius = 2
    this.turtles.setDefault('shape', 'circle')

    this.cmap = AS.ColorMap.Rgb256
    // REMIND: Three mouse picking: this.mouse = new Mouse(this, true).start()
    this.patches.ask(p => {
      p.ran = AS.util.randomFloat(1.0)
      p.ds = 0
    })

    this.patches.nOf(this.population).ask(p => {
      p.sprout(1, this.turtles, t => {
        t.setSize(5)
      })
    })
  }
  step () {
    this.turtles.ask((t) => {
      t.theta += AS.util.randomCentered(0.1)
      t.forward(t.speed)
      this.patches.inRadius(t.patch, this.radius, true).ask(p => {
        p.ran = Math.min(p.ran + 0.1, 0.8)
      })
    })

    this.patches.diffuse('ran', 0.05, this.cmap)
  }
}

const options = AS.Model.defaultWorld(2, 50)
options.minX = 2 * options.minX
options.maxX = 2 * options.maxY
const model = new DiffuseModel(document.body, options)
model.setup()
model.start()

/* TODO: move code below to app.js. here for convenience only. */

var MouseControl = function() {
  this.stopped = false;
};

window.onclick = function() {
    if (model.anim.stopped) {
        model.anim.start()
    }
    else {
        model.anim.stop()
    }
}
