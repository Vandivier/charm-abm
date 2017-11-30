//  ASX Wild Fork is a superset of AS & AS Core
//  Nondestructive wrapper atm and I hope it stays that way
//  But, it's possible to support mutation as well
//  i only put stuff in AS.util TODO: use another namespace
//  TODO: .mjs?

const AS = require('asx-abm');
const utils = require('./utils');
const SimpleBlindAnimator = require('./simple-blind-anim');

AS.util.SimpleBlindAnimator = SimpleBlindAnimator;

//  use soft floor by default
AS.util.randomNormalFloored = function(iAverage, iStandardDeviation, iFloor) {
    return AS.util.randomNormalFlooredSoft(iAverage, iStandardDeviation);
}

//  TODO: Math.max() vs redraw; and, should we allow === iFloor ?
//  hard floor moves illegals to boundary
AS.util.randomNormalFlooredHard = function(iAverage, iStandardDeviation, iFloor) {
    iFloor = iFloor || 0;
    return Math.max(AS.util.randomNormal(iAverage, iStandardDeviation), iFloor)
}

//  TODO: Math.max() vs redraw; and, should we allow === iFloor ?
//  soft floor redraws illegals
AS.util.randomNormalFlooredSoft = function(iAverage, iStandardDeviation, iFloor) {
    let iWorking = AS.util.randomNormal(iAverage, iStandardDeviation);
    iFloor = iFloor || 0;

    while (iWorking < iFloor) {
        iWorking = AS.util.randomNormal(iAverage, iStandardDeviation);
    }

    return iWorking;
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

// wraps faceCenter by moving up to the target and not past it
AS.util.approach = function(agentToTurn, agentToFace) {
    let vSize = agentToFace.size;
    let _x;
    let _y;
    let iDistanceRemaining;

    if (typeof vSize === 'undefined') { // it's a patch, assume size = 1
        _x = agentToFace.x + .5;
        _y = agentToFace.y + .5;
    } else {
        _x = agentToFace.x + vSize / 2;
        _y = agentToFace.y + vSize / 2;
    }

    agentToTurn.faceXY(_x, _y);
    iDistanceRemaining = AS.util.distance(agentToFace.x,
                                          agentToFace.y,
                                          _x,
                                          _y);
    agentToTurn.forward(Math.min(agentToTurn.speed, iDistanceRemaining));
}

module.exports = AS;
