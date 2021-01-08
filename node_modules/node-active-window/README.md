# node-active-window
> Get active window title in Node.js.

Compatible with Linux, Windows 7+, and OSX;

## Usage

```javascript
const monitor = require('node-active-window');

monitor.getActiveWindow((err, window) => {
    if (!err) {
        console.log(window); // { app: 'Code', title: 'test.js - node-active-window - Visual Studio Code' }
    }
});

```
## Tested on
- Windows 10
- Windows 7
- Linux 
  - Raspbian [lxdm]
  - Debian 8 [cinnamon]
- OSX

## License

MIT
