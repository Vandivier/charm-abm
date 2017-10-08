//  ASX Wild Fork is a superset of AS & AS Core
//  Nondestructive wrapper atm and I hope it stays that way
//  But, it's possible to support mutation as well
//  TODO: .mjs?

const AS = require('asx-abm');
const utils = require('./utils');

//  TODO: Math.max() vs redraw; and, should we allow === iFloor ?
AS.util.randomNormalFloored = function(iAverage, iStandardDeviation, iFloor) {
    iFloor = iFloor || 0;
    return Math.max(AS.util.randomNormal(iAverage, iStandardDeviation), iFloor)
}

// assumes a flat distrobution
AS.util.randomFromArray = function(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// utility method to assign a bunch of normalized properties concisely to an agent
AS.util.assignNormals = function (turtle, sArr, iAverage, iStandardDeviation) {
    utils.rev(sArr, sProperty => {
        turtle[sProperty] = AS.util.randomNormal(iAverage, iStandardDeviation);
    })
}

// AS.assignNormals with floored values
AS.util.assignFlooredNormals = function(turtle, sArr, iAverage, iStandardDeviation, iFloor) {
    utils.rev(sArr, sProperty => {
        turtle[sProperty] = AS.util.randomNormalFloored(iAverage, iStandardDeviation, iFloor);
    })
}

// this method faces the center of an agent instead of it's corner as in AS.Core:
//  face (agent) { this.theta = this.towards(agent); }
AS.util.faceCenter = function(agentToTurn, agentToFace) {
    let vSize = agentToFace.size;

    if (typeof vSize === 'undefined') { // it's a patch, assume size = 1
        agentToTurn.faceXY(agentToFace.x + .5, agentToFace.y + .5);
    } else {
        agentToTurn.faceXY(agentToFace.x + vSize / 2,
                           agentToFace.y + vSize / 2);
    }
}

module.exports = AS;
