# `צאט שולט`
An
`node.js` & 
`C# WinForms`
bases program that will allow all your friend, members and viewers to controll your game as one using Discord cahnnel!
###### (NOTE: C# WinForms module is not included as it uses ChefSharp chromium librrary wich is to havy)
## the idea
using [Discord.js](https://github.com/discordjs/discord.js) and a Discord BOT token (not included to prevent abuse of bot's token in multiple servers)
you can listen to messages at specific server cahnnel (configerable), the filter out only the "keys" messages (also configerable), then after calculation of each key was sent the most, attempt send the key to the currnt focus window using [kbm-robot](https://github.com/kylepaulsen/kbm-robot);
```text
if the window is the one set in configeration send it if not - ignore.
```

### hows:
- The GUI is HTML/JS based. using localhost and chrome(preffered) or default browser.
- In WinForm version it shows the localhost within the form.
- Get/Set data from the GUI/locahost is using [WebSocket-Node](https://github.com/theturtle32/WebSocket-Node) (also obs overlay).

## Modifications:
Slightly modified some node_modules included in here in order to make it compatible with snapshot exports in executable mode.
* kbm-robot: /kbm-robot.js - lines 5, 232, 240-250, 288-313.
* node-active-window: /index.js - lines 13, 42-79, 102, 126.
In both its mostly copy files from snapshot to local dir, rewriting paths and deleting the exported files it exit.

## Dependencies:
* [cli-color](https://github.com/medikoo/cli-color) - colorizing the console output. (licensed under - ISC License)
* [discord.js](https://github.com/discordjs/discord.js) - base comunication with discord. (licensed under - Apache-2.0 License)
* [kbm-robot](https://github.com/kylepaulsen/kbm-robot) - module for sending keys using JAVA. (licensed under - MIT License)
* [WebSocket-Node](https://github.com/theturtle32/WebSocket-Node) - websocket server for node. (licensed under -  Apache-2.0 License)
* [node-active-window](https://www.npmjs.com/package/node-active-window) - get current active window. (licensed under - MIT License)
