const monitor = require("node-active-window");

module.exports = {
    checkInterval: 2,
    currentWindow: undefined,

    set(key, val) {
        this[key] = val;
    }
};

monitor.getActiveWindow(function (err, window) {
    if (window) {
        module.exports.currentWindow = window.app;
    }
}, -1, module.exports.checkInterval);