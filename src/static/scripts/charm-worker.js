// a web worker to run a charm model
// reports to a main frame periodically
// ref: https://www.html5rocks.com/en/tutorials/workers/basics/
// ref: https://www.w3schools.com/html/html5_webworkers.asp

'use strict'

var AS = require('./static/scripts/asx-wf');
var ActiveModel = require('./static/scripts/education.js'); // TODO: constants in UI form and swappable at run time
var oWorkerState = {};

function main() {
    const options = AS.Model.defaultWorld(2, 50)
    options.minX = 2 * options.minX
    options.maxX = 2 * options.maxY

    const model = new ActiveModel(null, options)
    oWorkerState.model = model

    model.setup()
    model.start()

    fPeriodicallyReportState(1000);
}

function fPeriodicallyReportState(iMs) {
    postMessage(oWorkerState);
    setTimeout("fReportPeriodically()", iMs);
}

function onError(e) {
    postMessage('error in worker #'
                + oWorkerState.id
                + ':\n\r'
                + e.lineno
                + ' in '
                + e.filename
                + ': '
                + e.message)
}

self.addEventListener('message', function (e) {
    let data = e.data;
    switch (data.cmd) {
        case 'start':
            main();
            break;
        case 'stop':
            oWorkerState.stopped = true;
            self.close(); // Terminates the worker.
            break;
        case 'assign-id':
            oWorkerState.id = data.id;
            break;
        default:
            self.postMessage('Unknown command: ' + data.msg);
    };
}, false);

self.addEventListener('error', onError, false);
