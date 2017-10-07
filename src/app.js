'use strict'

var AS = require('./static/scripts/asx-wf');
var DiffuseModel = require('./static/scripts/diffuse.js');

function main() {
    initModel();
    AS.testWf();
}

function initModel() {
    //AS.util.setScript('static/scripts/diffuse.js');

    const options = AS.Model.defaultWorld(2, 50)
    options.minX = 2 * options.minX
    options.maxX = 2 * options.maxY

    const model = new DiffuseModel(document.body, options)
    window.model = model; //facilitate debugging

    model.setup()
    model.start()

    //  TODO: freeze model time without preventing model rotation, zoom, etc?
    window.onkeyup = function (e) {
        if(e.keyCode == 32){
            if (model.anim.stopped) {
                model.anim.start()
            } else {
                model.anim.stop()
            }
        }
    }
} 

main();
