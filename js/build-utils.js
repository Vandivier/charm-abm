const fs = require("fs");
const path = require("path");
const json = JSON.parse(fs.readFileSync('package.json'));

const rmdir = function (dir) {
    var list = fs.readdirSync(dir);
    for (var i = 0; i < list.length; i++) {
        var filename = path.join(dir, list[i]);
        var stat = fs.statSync(filename);

        if (filename == "." || filename == "..") {
            // pass these files
        } else if (stat.isDirectory()) {
            // rmdir recursively
            rmdir(filename);
        } else {
            // rm fiilename
            fs.unlinkSync(filename);
        }
    }
    fs.rmdirSync(dir);
};

const pkgkey = function (key) {
    if (!key) throw new Error('pkgkey called with no argument');
    let val = json[key];
    if (!val) throw new Error(`pkgkey: ${key} not found`);
    if (Array.isArray(val)) val = val.join(' ');

    return val;
}

module.exports = {
    rmdir: rmdir,
    pkgkey: pkgkey
};
