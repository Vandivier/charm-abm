'use strict'

var AS = require('./static/scripts/asx-wf');
var ActiveModel = require('./static/scripts/education.js'); // TODO: constants in UI form and swappable at run time

main();

function main() {
    initModel();
}

function initModel() {
    const optionsWorld = AS.Model.defaultWorld(2, 50)
    optionsWorld.minX = 2 * optionsWorld.minX
    optionsWorld.maxX = 2 * optionsWorld.maxY

    // ref: AS.premodule.js, class Three, static defaultOption
    static fCustomRendererOptions(useThreeHelpers = true, useUIHelpers = true) {
        const options = {
            // include me in options so Model can instanciate me!
            Renderer: Three, // REMIND: use string.
            orthoView: false, // 'Perspective', 'Orthographic'
            clearColor: 0x000000, // clear to black
            useAxes: useThreeHelpers, // show x,y,z axes
            useGrid: useThreeHelpers, // show x,y plane
            useControls: useThreeHelpers, // navigation. REMIND: control name?
            useStats: useUIHelpers, // show fps widget
            useGUI: useUIHelpers, // activate dat.gui UI
            // meshes: {
            patches: {
                meshClass: 'PatchesMesh'
            },
            turtles: {
                meshClass: 'QuadSpritesMesh'
                // meshClass: 'PointsMesh'
            },
            links: {
                meshClass: 'LinksMesh'
            }
            // }
        };
        // util.forEach(options.meshes, (val, key) => {
        //   const Mesh = Meshes[val.meshClass]
        //   const meshOptions = Mesh.options()
        //   val.options = meshOptions
        // })
        util.forEach(options, (val, key) => {
            if (val.meshClass) {
                const Mesh = Meshes[val.meshClass];
                const meshOptions = Mesh.options();
                val.options = meshOptions;
            }
        });

        return options
    }

    const model = new ActiveModel(document.body, optionsWorld)
    window.model = model; //facilitate debugging
    window.aturtle = model.turtles[0]; //facilitate debugging
    window.apatch = model.patches[0]; //facilitate debugging

    model.setup()
    model.start()

    //  TODO: freeze model time without preventing model rotation, zoom, etc?
    window.onkeyup = function (e) {
        if (e.keyCode == 32) { // space bar
            if (model.anim.stopped) {
                model.anim.start()
            } else {
                model.anim.stop()
            }
        }

        if (e.keyCode == 13) { // enter key
            model.turtles.ask(turtle => { // shake up turtle locations
                turtle.moveTo(AS.util.oneOf(model.patches))
            });
        }
    }
}
