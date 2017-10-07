//  ASX Wild Fork is a superset of AS & AS Core
//  Nondestructive wrapper atm and I hope it stays that way
//  But, it's possible to support mutation as well
//  TODO: .mjs?

const AS = require('asx-abm');

AS.testWf = function() {
    console.log('wild fork is here');
}

AS.randomNormalFloored = function(iAverage, iStandardDeviation, iFloor) {
    iFloor = iFloor || 0;
    return Math.max(AS.util.randomNormal(iAverage, iStandardDeviation), iFloor)
}

// assumes a flat distrobution
AS.randomFromArray = function(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

module.exports = AS;
