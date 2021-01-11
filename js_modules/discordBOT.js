const configer = require("./configer.js");
const Discord = require("discord.js");
const discordLog = "[discordBot]: ";

var client;
var activityStr = "מחכה לפקודות בחדר מאושר..";
var isConnected = false,
    botConnErr;
var botInvite;

function error(err) {
    console.log("\n" + err);
    botConnErr = err;
    if (module.exports.onError)
        module.exports.onError(err);
}


module.exports = {
    onError: undefined,
    onLogin: undefined,
    onOut: undefined,
    onJoin: undefined,

    /**
     * checks if the message is allowed to be sent(if in correct channel & not blakclisted user) then it triggers the onKeyEvent([message,jsFavo,sender name])
     * @param {discordMessgaeObj} message 
     */
    onMSG_Event: function (message) {
        const settings = configer.get();
        if (settings.lister.blackList.indexOf(message.author.username) != -1) return;

        if (message.channel.name == undefined) {
            console.log("error no channel name");
            return;
        }

        const isChatControlRoom = message.channel.name.includes(settings.discordChannel);
        if (message.author.bot || !isChatControlRoom) {
            console.log("error, msg from bot / no in chat room");
            return;
        }

        const tempActivity = message.channel.name + " - מאזין לפקודות";
        if (tempActivity != activityStr) {
            activityStr = tempActivity;
            client.user.setActivity(activityStr);
        }

        let allowedStrArr = Object.assign([], settings.keySender.keys);
        for (let key in settings.keySender.alterKeys) {
            allowedStrArr.push(key);
        }
        const cleanMsg = message.content.toLowerCase();
        if (allowedStrArr.indexOf(cleanMsg) == -1) {
            console.log("error, message is not from allowed list");

            return;
        }

        const isFavo = settings.lister.favoList.indexOf(message.author.username) != -1;
        module.exports.keySender_OnNewMessage(cleanMsg, isFavo, message.author.username);
        return;
    },
    keySender_OnNewMessage: undefined,
    ini: function () {
        if (isConnected) {
            module.exports.Disconnect();
        }
        client = new Discord.Client();
        client.on("ready", (res) => {
            isConnected = true;
            console.log(res)
            if (client.user)
                console.log(`${discordLog}I am ready! Logged in as ${client.user.tag}!`);
            if (module.exports.onLogin)
                module.exports.onLogin();

            client.user.setActivity(activityStr);
            client.generateInvite({
                    permissions: ["READ_MESSAGE_HISTORY", "MANAGE_MESSAGES"]
                })
                .then(link => {
                    botInvite = inviteLink = link;
                });
        });

        client.on("disconnect", function (event) {
            module.exports.Disconnect();
        });

        client.on("guildCreate", guild => {
            if (module.exports.onJoin)
                module.exports.onJoin();
        })

        client.on("guildDelete", guild => {
            if (module.exports.onJoin)
                module.exports.onJoin();
        })

        client.on("error", error)
        client.on("message", module.exports.onMSG_Event);
        client.login(configer.get().token).catch(error);

    },

    getLink: function () {
        return botInvite;
    },

    set: function (key, val) {
        this[key] = val;
    },

    serverConn: function () {
        var serverArr = [];
        client.guilds.cache.forEach(server => {
            serverArr.push([server.name, server.iconURL({
                size: 128
            })])
        });
        return serverArr;
    },

    isOn: function () {
        if (!isConnected && botConnErr) {
            let ref = botConnErr + "";
            botConnErr = undefined
            return ref;
        }
        return isConnected;
    },

    Disconnect: function () {
        console.log(`${discordLog}Disconnected.`);
        isConnected = false;
        client.destroy();
        if (module.exports.onOut)
            module.exports.onOut();
    }
};
if (configer.get().token != null)
    module.exports.ini();