const monitor = require("node-active-window");
const configer = require("./configer.js");

module.exports = {
    window: undefined,
    checkInterval: undefined,
    currentWindow: undefined,

    set(key, val) {
        this[key] = val;
    }
};

const settingsObj = configer.get();
module.exports.window = settingsObj.window;
module.exports.checkInterval = 2;
module.exports.currentWindow = undefined;

monitor.getActiveWindow(function (err, window) {
    if (window)
        module.exports.currentWindow = window.app;
}, -1, module.exports.checkInterval);