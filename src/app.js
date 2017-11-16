'use strict'

var AS = require('./static/scripts/asx-wf');
var ActiveModel = require('./static/scripts/education.js'); // TODO: constants in UI form and swappable at run time

function main() {
    initModel();
}

function initModel() {
    const options = AS.Model.defaultWorld(2, 50)
    options.minX = 2 * options.minX
    options.maxX = 2 * options.maxY

    const model = new ActiveModel(document.body, options)
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

main();
