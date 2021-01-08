const monitor = require('./index.js');

monitor.getActiveWindow((err, window) => {
    if (!err) {
        console.log(window);
    }
});