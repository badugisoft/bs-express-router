var path = require('path');
var fs = require('fs');
var express = require('express');

var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
var ARGUMENT_NAMES = /([^\s,]+)/g;
var OPTIONS = /\/\/#\s*([^\s]+)\s*:\s*([^\s]*)\s*$/mg;

function parseFunction(func) {
    var fnStr = func.toString().replace(STRIP_COMMENTS, '');
    var params = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);

    var options = {}, match;
    fnStr = func.toString();
    while ((match = OPTIONS.exec(fnStr)) !== null) {
        options[match[1]] = match[2];
    }

    return { params: params || [], options: options, func: func };
}

function loadFile(file) {
    console.log('loadFile', file);
    var router = express.Router();
    var controllers = require(file);

    for (var name in controllers) {
        var controller = controllers[name];
        if (typeof controller !== 'function') {
            continue;
        }

        var func = parseFunction(controller);

        console.log('*', name, func);
    }

    return router;
}

function loadDir(dir) {
    var router = express.Router();
    var dirPath = path.resolve(dir || 'controller');
    var files = fs.readdirSync(dirPath);

    for (var i in files) {
        var fileName = files[i];
        var filePath = path.join(dirPath, fileName);
        if (fs.statSync(filePath).isDirectory()) {
            router.use('/' + fileName, loadDir(filePath))
        }
        else if (path.extname(fileName) == '.js'){
            router.use('/' + path.basename(fileName, '.js'), loadFile(filePath))
        }
    }


    return router;
}

module.exports = loadDir;
