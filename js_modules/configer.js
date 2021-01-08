const {
    kStringMaxLength
} = require('buffer');
const fs = require('fs');
const path = require("path");
const configFile = path.join(process.cwd(), "/config.json");
var configObj = require(process.cwd() + "/config.json");

if (configObj == undefined || JSON.stringify(configObj) == "{}") {
    saveConfig();
}

function saveConfig() {
    if (configObj == undefined || JSON.stringify(configObj) == "{}") {
        console.error("CONFIG obj is undefined! error save it..");
        configObj = difConfig();
    }
    fs.stat(configFile, function (sts) {
        if (sts != undefined && sts != null)
            return console.error("file doesnt exsit: " + sts);

        fs.writeFile(configFile, JSON.stringify(configObj, null, '\t'), function (err) {
            if (sts != undefined && sts != null)
                return console.error("cant write to file: " + err);
        })
    })
}

function difConfig() {
    const conf = {
        token: null,
        window: "",
        keySender: {
            keys: ["w", "a", "s", "d", "shift", "ctrl", "space"],
            alterKeys: {
                jump: "space"
            },
            multipleKeys: "w,a,s,d,shift,ctrl,space".split(","),
            duration: 500
        },
        lister: {
            blackList: [],
            favoList: []
        },
        discordChannel: "chatctrl",
        browser: 1
    }
    return conf;
}

module.exports = {
    /**
     * @param {string} field get field within config
     */
    get: function (field) {
        const refConfig = Object.assign({}, configObj);
        if (!field)
            return refConfig;
        const objField = refConfig[field];
        if (objField == undefined) {
            const fallbackConfig = difConfig();
            return fallbackConfig[field];
        }
        return objField;
    },
    /**
     * @param {string} field within the config
     * @param {*} data the data to set to
     */
    set: function (field, data) {
        configObj[field] = data;
        saveConfig();
        //TODO: save to file
    }
};