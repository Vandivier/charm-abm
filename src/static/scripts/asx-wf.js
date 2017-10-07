//  ASX Wild Fork is a superset of AS & AS Core
//  Nondestructive wrapper atm and I hope it stays that way
//  But, it's possible to support mutation as well
//  TODO: .mjs?

const AS = require('asx-abm');

AS.testWf = function() {
    console.log('wild fork is here');
}

module.exports = AS;
