const configer = require("./configer.js");
const discordBot = require("./discordBOT.js");
const WebSocketServer = require('websocket').server;
const exec = require('child_process').exec;
const fs = require('fs');
const http = require('http');

module.exports.clinetShowWS;
module.exports.settingsWS;
const wsProtocols = ["show", "settings"],
    port = 3254;

var localHost = {
    serverPath: __dirname + "/../serverFiles/",
    server: undefined,
    httpResponse: function (request, response) {
        var urlPath = request.url.toLocaleLowerCase()
        if (request.url.toLocaleLowerCase() == "/show") {
            urlPath = "show.html";
        } else if (request.url.toLocaleLowerCase() == "/" || request.url.toLocaleLowerCase() == "/settings") {
            urlPath = "settings.html";
        }
        const mime = {
            html: 'text/html',
            txt: 'text/plain',
            css: 'text/css',
            gif: 'image/gif',
            jpg: 'image/jpeg',
            png: 'image/png',
            svg: 'image/svg+xml',
            js: 'application/javascript'
        };
        let formatType = urlPath.split(".")[1];
        const isImage = ["gif", "jpg", "png", "svg"].indexOf(formatType) != -1;
        fs.readFile(localHost.serverPath + urlPath, (isImage) ? "" : "utf-8", function (err, data) {
            if (err) {
                response.write(JSON.stringify(err));
                response.end();
                return console.log(err);
            }

            var type = mime[formatType] || 'text/plain';
            response.writeHead(200, {
                'Content-Type': type
            });
            if (isImage)
                response.end(data, 'binary');
            else {
                body = data.replace("{0}", port);
                response.end(body, 'utf8');
            }
        });
    },
    serverFirstLoad: function () {
        console.log('[LocalHost]: Server is listening on port ' + port);
        var myArgs = process.argv.slice(2);
        if (myArgs.indexOf("asApp") == -1)
            setTimeout(() => {
                if (module.exports.settingsWS == undefined) {
                    setTimeout(() => {
                        if (module.exports.settingsWS == undefined) {
                            DeepOpenBrowser();
                        }
                    }, 200);
                }
            }, 2000);

    },

    WS: undefined,
    WS_on_request: function (request) {
        if (!this.WS_isOriginAllowed(request))
            return;

        const reqProtocol = request.requestedProtocols[0];
        var connection = request.accept(reqProtocol, request.origin);
        console.log('[LocalHost]: WS Connection accepted - ' + reqProtocol);
        connection.on('close', this.WS_onConnectionClose.bind(this, connection));
        if (reqProtocol == "settings") {
            connection.on('message', this.WS_onSettingsMessage);
            if (module.exports.settingsWS) { //if settings already open - close connection and save new one
                module.exports.settingsWS.send("-1");
                module.exports.settingsWS.drop();
                module.exports.settingsWS = undefined;
            }
            module.exports.settingsWS = connection;
            let info = {
                settings: configer.get(),
                login: module.exports.clinetShowWS != undefined,
                discordOn: discordBot.isOn(),
            };
            module.exports.SettingsSend(info);
            module.exports.GetAllWindows(true);
        } else {
            if (module.exports.clinetShowWS) { //if client allready open closed it and open new one
                module.exports.clinetShowWS.send("-1");
                module.exports.clinetShowWS.drop();
                module.exports.clinetShowWS = undefined;
            }
            module.exports.clinetShowWS = connection;
            module.exports.SettingsSend({
                login: true
            });
        }
    },
    WS_isOriginAllowed: function (request) {
        var origin = request.origin
        if (origin != "http://localhost:" + port) {
            request.reject();
            console.log("ws login attempt BLOCKED from: " + request.origin);
            return false;
        }
        const reqProtocol = request.requestedProtocols[0];
        if (wsProtocols.indexOf(reqProtocol) == -1) {
            request.reject("websocket is not allowed!  :/");
            return false;
        }
        return true;
    },
    WS_onConnectionClose: function (connection) {
        const isConnectionClient = connection == module.exports.clinetShowWS;
        if (isConnectionClient) {
            module.exports.SettingsSend({
                "login": false
            });
        } else {
            setTimeout(() => {
                if (module.exports.settingsWS == undefined)
                    process.exit();
            }, 1000);

        }

        var refConn = ((isConnectionClient) ? "clinetShowWS" : "settingsWS");
        module.exports[refConn] = undefined;
        console.log('[LocalHost]: WS client [' + refConn + '] disconnected');
    },
    WS_onSettingsMessage: function (message) {
        var msg = (message.utf8Data);
        var JSONed = hasJsonStructure(msg);
        if (!JSONed)
            return console.log("missconfig:" + msg);

        if (JSONed.getWins)
            module.exports.GetAllWindows();
        if (JSONed.getConfig)
            module.exports.SettingsSend(configer.get());
        if (JSONed.discordLink) {
            const link = discordBot.getLink();
            module.exports.SettingsSend({
                discordLink: link
            });
        }
        if (JSONed.conServers) {
            module.exports.SettingsSend({
                conServers: discordBot.serverConn()
            });
        }
        if (JSONed.disconnect) {
            discordBot.Disconnect();
        }


        if (JSONed.settings) {
            const config = configer.get();
            const newSetting = JSONed.settings;
            const unNullable = ["window", "discordChannel", "duration", "keys"];
            for (let key in newSetting) {
                if (unNullable.indexOf(key) != -1 && newSetting[key] == "") {
                    let resend = {
                        settings: {}
                    };
                    resend.settings[key] = config[key];
                    module.exports.SettingsSend(resend);
                    continue;
                }

                if (typeof newSetting[key] == "object") {
                    if (newSetting[key] != undefined && newSetting[key] != null) {
                        for (let subKey in newSetting[key]) {
                            if (unNullable.indexOf(subKey) != -1 && newSetting[key][subKey] == "") {
                                let resend = {
                                    settings: {}
                                };
                                resend.settings[key] = {};
                                resend.settings[key][subKey] = config[key][subKey];
                                module.exports.SettingsSend(resend);
                                delete newSetting[key][subKey];
                            }
                        }
                        configer.set(key, Object.assign(config[key], newSetting[key]));
                    }
                } else {
                    configer.set(key, newSetting[key]);
                }
                if (key == "token") {
                    discordBot.ini();
                }
            }
        }


    },
    ini: function () {
        this.server = http.createServer(this.httpResponse);
        this.server.listen(port, localHost.serverFirstLoad);
        this.WS = new WebSocketServer({
            httpServer: this.server,
            autoAcceptConnections: false
        });
        this.WS.on('request', this.WS_on_request.bind(this));
    }
};
localHost.ini();


discordBot.set("onLogin", () => {
    module.exports.SettingsSend({
        discordOn: true
    })
})
discordBot.set("onOut", () => {
    module.exports.SettingsSend({
        discordOn: false
    })
})
discordBot.set("onError", (error) => {
    module.exports.SettingsSend({
        discordOn: error + "."
    })
})
discordBot.set("onJoin", () => {
    module.exports.SettingsSend({
        conServers: discordBot.serverConn()
    })
})

module.exports = {

    ShowOnWebClint(keys, isSend, isFavo, sender) {
        if (!module.exports.clinetShowWS) {
            console.log("[ObsDisplay_WS]: not yet connected - open http://localhost:8080/show at obs.");
            return;
        }

        var loopKeys;
        if (typeof keys == "string")
            loopKeys = [keys];
        else
            loopKeys = Object.assign(keys);

        for (var x = 0; x < loopKeys.length; x++) {
            const jsoned = {
                key: loopKeys[x],
                isFinal: isSend,
                isFavo: isFavo,
                sender: sender
            }
            module.exports.clinetShowWS.send(JSON.stringify(jsoned));
        }
    },

    SettingsSend(obj) {
        if (!module.exports.settingsWS)
            return;
        module.exports.settingsWS.send(JSON.stringify(obj));
        let ref = Object.assign(obj);
        let token = "kvojkf84jbkxhb6 ,oud";
        if (ref.settings && ref.settings.token)
            token = ref.settings.token;
        console.log("[Settings_WS]: sends:" + JSON.stringify(ref).replace(token, "XXXXXX"))
    },

    GetAllWindows() {
        exec('tasklist', function (error, stdout, stderr) {
            var lines = stdout.trim().split("\n"); //split by line
            var processes = lines.slice(2); //remove the table headers
            var parsed = processes.map(function (process) {
                return process.match(/(.+?)[\s]+?(\d+)/); //match the process name and ID
            });

            var filtered = parsed.filter(function (process) {
                if (process.input.includes("Console") && process[0].includes(".exe"))
                    return true;
                return false;
            });
            let appMap = {};
            const blackList = ["NVDisplay", "csrss", "winlogon", "dwm", "sihost", "svchost", "taskhostw", "NvBroadcast", "explorer", "rundll32", "NVIDIA Web Helper", "GraphicsCardEngine",
                "Check_Kill", "RtkAudUService64", "steamwebhelper", "dllhost", "cmd", "node", "obs-browser-page", "CodeHelper", "tasklist", "fontdrvhost", "ctfmon", "nvcontainer", "ShellExperienceHost",
                "conhost", "RGBFusion", "mbamtray", "RuntimeBroker", "SearchUI", "SettingSyncHost", "nvsphelper64", "smartscreen", "SecurityHealthSystray", "FileCoAuth", "powershell", "UnityCrashHandler32", "GameBarPresenceWriter",
                "GameBar", "GameOverlayUI", "GameBarFTServer", "backgroundTaskHost", "ApplicationFrameHost", "SndVol"
            ];
            filtered.sort();
            for (let key in filtered) {
                let appName = filtered[key][1];
                if (!appName.includes("."))
                    continue;
                appName = appName.split(".")[0];
                if (!appMap[appName] && blackList.indexOf(appName) == -1)
                    appMap[appName] = 1;
            }

            var sentit = {
                wins: appMap
            };
            module.exports.SettingsSend(sentit)
        });
    }

};

function hasJsonStructure(str) {
    if (typeof str !== 'string') return false;
    try {
        const result = JSON.parse(str);
        const type = Object.prototype.toString.call(result);
        return (type === '[object Object]' || type === '[object Array]') ? result : false;
    } catch (err) {
        return false;
    }
}

function DeepOpenBrowser() {

    const url = 'http://localhost:' + port;
    var start = (process.platform == 'win32') ? 'start' : 'xdg-open';
    const index = configer.get("browser");
    if (index == 1 || index == "") {
        exec(start + " chrome.exe --app={0} --new-window".replace("{0}", url), function (error, stdin, stdout) {
            if (error == null) {
                configer.set("browser", 1);
            } else {
                configer.set("browser", 2);
                DeepOpenBrowser();
            }
        });
    } else {
        exec(start + ' ' + url);
    }
}