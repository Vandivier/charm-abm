// cross-project utils
'use strict'

let utils = {};

// a reverse for loop
utils.rev = function(arr, f) {
    for (let i = arr.length; i--;) {
        f(arr[i], i);
    }
}

// ref: https://stackoverflow.com/questions/11246758/how-to-get-unique-values-in-an-array
// ref: https://jsperf.com/get-unique-elements
Array.prototype.unique = function() {
    var arr = [];
    for(var i = 0; i < this.length; i++) {
        if(!arr.includes(this[i])) {
            arr.push(this[i]);
        }
    }
    return arr; 
}

module.exports = utils;
