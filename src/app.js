'use strict'

var AS = require('./static/scripts/asx-wf');
var ActiveModel = require('./static/scripts/education.js'); // TODO: constants in UI form and swappable at run time

var bBlindMode = true; // true by default to simplify scraping

main();

function main() {
    initModel();
}

function initModel() {
    const optionsWorld = AS.Model.defaultWorld(2, 50)
    optionsWorld.minX = 2 * optionsWorld.minX
    optionsWorld.maxX = 2 * optionsWorld.maxY

    // ref: AS.premodule.js, class Three, static defaultOption
    function fCustomRendererOptions(useThreeHelpers = true, useUIHelpers = true) {
        const options = {
            // include me in options so Model can instanciate me!
            Renderer: AS.Three, // REMIND: use string.
            orthoView: false, // 'Perspective', 'Orthographic'
            clearColor: 0x000000, // clear to black
            useAxes: useThreeHelpers, // show x,y,z axes
            useGrid: useThreeHelpers, // show x,y plane
            useControls: useThreeHelpers, // navigation. REMIND: control name?
            useStats: useUIHelpers, // show fps widget
            useGUI: false, // activate dat.gui UI
            patches: {
                meshClass: 'PatchesMesh'
            },
            turtles: {
                meshClass: 'QuadSpritesMesh'
            },
            links: {
                meshClass: 'LinksMesh'
            }
        };

        AS.util.forEach(options, (val, key) => {
            if (val.meshClass) {
                const Mesh = Meshes[val.meshClass];
                const meshOptions = Mesh.options();
                val.options = meshOptions;
            }
        });

        return options
    }

    const model = new ActiveModel(document.body, optionsWorld, fCustomRendererOptions()) // TODO: refactor AS.model for hot-swappable render. Atm I have to restart
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

function fReset() {
    model.restart(true);
}

function fToggleBlind() {
    bBlindMode = !bBlindMode;
}
