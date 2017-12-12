'use strict'

const AS = require('./static/scripts/asx-wf');
const ActiveModel = require('./static/scripts/education.js'); // TODO: constants in UI form and swappable at run time

const elLog = document.querySelector('.log-text-div');

main();

function main() {
    initModel();
}

function initModel() {
    const optionsWorld = AS.Model.defaultWorld(2, 40)
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

        return options;
    }

    const elDiv = document.querySelector('.model-div');
    let model = new ActiveModel(elDiv, optionsWorld, fCustomRendererOptions())
    model.bUseBlindAnim = true;

    window.model = model; //facilitate debugging
    window.aturtle = model.turtles[0]; //facilitate debugging
    window.apatch = model.patches[0]; //facilitate debugging
}

//  TODO: freeze model time without preventing model rotation, zoom, etc?
window.onkeyup = function (e) {
    if (e.keyCode == 13) { // enter key
        model.fPause();
    }
}

model.fPause = function (e) {
    if (model.anim.stopped) {
        model.anim.start()
    } else {
        model.anim.stop()
    }
}

model.fReset = function () {
    model.stop();
    model.reset();
}

// re-setup() then start()
model.fWFStart = function() {
    model.setup();
    model.start();
}

// atm u have to toggle off before first setup and start
// TODO: hot-swapping fToggleBlind
model.fToggleBlind = function () {
    model.bUseBlindAnim = !model.bUseBlindAnim;
}

model.fLogStats = function () {
    elLog.innerText += ('\n\rblind mode: ' + model.bUseBlindAnim);
    elLog.innerText += ('\n\rticks: ' + model.anim.ticks);

    // now scroll down to latest log
    elLog.scrollTop = elLog.scrollHeight;
}

model.fClearLog = function () {
    elLog.innerText = '';
}
