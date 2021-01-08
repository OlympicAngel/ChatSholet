const configer = require("./configer.js");
const windowState = require("./windowSts.js");
const localhost = require("./localhost.js");
const robot = require("kbm-robot");


function IsBlockedCombo(a, b, arr) {
    return (a == arr[0] && b == arr[1]) ||
        (a == arr[1] && b == arr[0]);
}


module.exports = {
    jarState: false,
    keysStack: {},
    pressing: false,

    OnNewMessage(msg, isFavo, sender) {
        const settings = configer.get();
        localhost.ShowOnWebClint(msg, false, isFavo, sender);

        if (windowState.currentWindow.toLowerCase() != settings.window.toLowerCase()) {
            if (this.jarState) {
                this.jarState = false;
                robot.stopJar();
                return console.log("[discordBot]: stops collecting messgaes as the window is not in focus.");
            }
            console.log(windowState.currentWindow.toLowerCase() + "!=" + settings.window.toLowerCase());
            return;
        }

        if (!this.jarState) {
            this.jarState = true;
            robot.startJar();
            console.log("[discordBot]: starts collecting messgaes(window in focus)....");
        }

        //scan alternativ keys and switch to its real name key
        for (let key in settings.keySender.alterKeys) {
            if (msg == key) {
                msg = settings.keySender.alterKeys[key];
                break;
            }
        }

        var addPerMessage = 1;
        if (isFavo)
            addPerMessage++;

        if (!this.keysStack[msg])
            this.keysStack[msg] = addPerMessage;
        else
            this.keysStack[msg] += addPerMessage;

        localhost.SettingsSend({
            botData: this.keysStack
        })

        if (!this.pressing) {
            this.SendKey();
        }

    },

    SendKey() {
        const keyStackCOPY = Object.assign(this.keysStack);
        this.keysStack = {};

        const settings = configer.get();
        this.pressing = true;
        var mostCommon = {
                key: "",
                amount: 0
            },
            secCommon = {
                key: "",
                amount: 0
            };
        for (let key in keyStackCOPY) {
            if (keyStackCOPY[key] > mostCommon.amount) {
                secCommon.key = mostCommon.key + "";
                secCommon.amount = mostCommon.amount + 0;

                mostCommon.amount = keyStackCOPY[key];
                mostCommon.key = key;
            } else if (secCommon.amount == 0) {
                secCommon.amount = keyStackCOPY[key];
                secCommon.key = key;
            }
        }

        var keyToSend = [mostCommon.key];
        const secKey = secCommon.key;
        if (secCommon.amount / mostCommon.amount >= 0.6) {
            const multipeKeysOption = settings.keySender.multipleKeys;
            if (multipeKeysOption.indexOf(keyToSend) != -1 && multipeKeysOption.indexOf(secKey)) {
                if (IsBlockedCombo(keyToSend, secKey, ["w", "s"]) ||
                    IsBlockedCombo(keyToSend, secKey, ["a", "d"]) ||
                    IsBlockedCombo(keyToSend, secKey, ["shift", "tab"])) {
                    //blocked combination send only top most key
                } else {
                    keyToSend.push(secKey);
                }
            }
        }
        const pressLength = Number(settings.keySender.duration);

        console.log("[discordBot]: sending key-" + keyToSend + "/" + mostCommon.amount + ".");
        if (secCommon.key != "")
            console.log("[discordBot]: (2d key-" + secCommon.key + "/" + secCommon.amount + ")");

        if (keyToSend.length != undefined && keyToSend.length == 2) {
            console.log("               also sending " + secCommon.key + ".");

            robot
                .press(keyToSend[0]).press(keyToSend[1])
                .sleep(pressLength)
                .release(keyToSend[0]).release(keyToSend[1])
                .go();
        } else {
            robot
                .press(keyToSend[0])
                .sleep(pressLength)
                .release(keyToSend[0])
                .go();
        }
        setTimeout(() => {
            module.exports.pressing = false;
        }, pressLength + 20);

        localhost.ShowOnWebClint(keyToSend, true, false);
    },


    set(key, val) {
        this[key] = val;
    }

};