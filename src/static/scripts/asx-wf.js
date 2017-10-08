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

//  the 'adjusted' part refers to the fact that patch.x, patch.y is the corner of the region.
//  this function assumes a width/l/h of 1, so the adjustment is .5 to get the center coordinate
//  similarly, turtles need to be adjusted for size
//  we assume a turtle is going to a destination with this method
//  the result theta comes from the middle of turtle going to the middle of a patch
AS.util.adjustedTheta = function(turtleFrom, patchTo) {
    let iAgentSizeAdjustment = turtleFrom.size / 2;
    let iFromX = turtleFrom.x + iAgentSizeAdjustment;
    let iFromY = turtleFrom.y + iAgentSizeAdjustment;
    let iToX = patchTo.x + .5;
    let iToY = patchTo.y + .5;

    return AS.util.fiCalculatetheta(iFromX, iFromY, iToX, iToY);
}

// ref: https://stackoverflow.com/questions/9614109/how-to-calculate-an-angle-from-points
// ref: https://www.w3schools.com/jsref/jsref_atan2.asp
AS.util.fiCalculatetheta = function(iFromX, iFromY, iToX, iToY) {
    let iFromTan = Math.atan2(iFromY, iFromX);
    let iToTan = Math.atan2(iToY, iToX);

    //let x = (iFromX - iToX);
    //let y = (iFromY - iToY);

    return iFromTan - iToTan;
}

module.exports = AS;
