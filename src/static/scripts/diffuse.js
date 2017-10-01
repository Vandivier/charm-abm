//AS.util.toWindow({ AS.ColorMap, AS.DataSet, AS.Model, AS.util })

class DiffuseModel extends AS.Model {
  setup () {
    this.patches.own('ran ds')
    this.turtles.setDefault('speed', 0.5)
    this.turtles.setDefault('atEdge', 'wrap')
    this.turtles.setDefault('size', 5)
    this.population = 2
    this.radius = 6

    // this.cmap = ColorMap.Jet
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

const options = AS.Model.defaultWorld(2, 100)
options.minX = 2 * options.minX
options.maxX = 2 * options.maxY
const model = new DiffuseModel(document.body, options).start()
model.whenReady(() => {
  // debugging
  console.log('patches:', model.patches.length)
  console.log('turtles:', model.turtles.length)
  const {world, patches, turtles, links} = model
  AS.util.toWindow({ world, patches, turtles, links, model })
})