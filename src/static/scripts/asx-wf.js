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

module.exports = AS;
