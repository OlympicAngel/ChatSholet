const fs = require('fs');
const configs = require('./configs.json');
const path = require('path');
const config = getConfig();

exports.getActiveWindow = function (callback, repeats = 1, interval = 0) {
    const spawn = require('child_process').spawn;

    //Scape negative number of repeats on Windows OS
    if (process.platform == 'win32' && repeats < 0) {
        repeats = '\\-1';
    }

    let parameters = Object.assign([], config.parameters);
    parameters.push(repeats);
    parameters.push(process.platform == 'win32' ? (interval * 1000 | 0) : interval);

    const ls = spawn(config.bin, parameters);
    ls.stdout.setEncoding('utf8');

    ls.stdout.on('data', function (stdout) {
        callback(null, reponseTreatment(stdout.toString()));
    });

    //Obtain error response from script
    ls.stderr.on("data", function (stderr) {
        callback(stderr.toString(), null);
    });

    ls.stdin.end();
}

/**
* Treat and format the response string and put it into a object
* @function reponseTreatment
* @param {string} String received from script
*/
function reponseTreatment(response) {
    window = {};
    if (process.platform == 'linux') {
        response = response.replace(/(WM_CLASS|WM_NAME)(\(\w+\)\s=\s)/g, '').split("\n", 2);
        window.app = response[0];
        window.title = response[1];
    } else if (process.platform == 'win32') {
        response = response.replace(/(@{ProcessName=| AppTitle=)/g, '').slice(0, -1).split(';', 2);
        window.app = response[0];
        window.title = response[1];
    } else if (process.platform == 'darwin') {
        response = response.split(",");
        window.app = response[0];
        window.title = response[1].replace(/\n$/, "").replace(/^\s/, "");
    }
    return window;
}

function getConfig() {
    let config;

    switch (process.platform) {
        case 'linux':
        case 'linux2':
            config = configs.linux
            break;
        case 'win32':
            config = configs.win32
            break;
        case 'darwin':
            config = configs.mac;
            break;
        default:
            throw "Operating System not supported yet. " + process.platform;
    }

    //Append directory to script url
    script_url = path.join(__dirname, config.script_url);
    config.parameters.push(script_url);

    //Append directory to subscript url on OSX
    if (process.platform == 'darwin') {
        config.parameters.push(path.join(__dirname, config.subscript_url));
    }

    return config;
}
