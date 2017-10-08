// cross-project utils
'use strict'

let utils = {};

// a reverse for loop
utils.rev = function(arr, f) {
    for (let i = arr.length; i--;) {
        f(arr[i], i);
    }
}

module.exports = utils;
