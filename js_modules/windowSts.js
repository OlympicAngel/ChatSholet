const monitor = require("node-active-window");

module.exports = {
    checkInterval: 2,
    currentWindow: "",

    set(key, val) {
        this[key] = val;
    }
};

monitor.getActiveWindow(function (err, window) {
    if (window) {
        if (module.exports.currentWindow != window.app)
            console.log(window.app);
        module.exports.currentWindow = window.app;
    }
}, -1, module.exports.checkInterval);