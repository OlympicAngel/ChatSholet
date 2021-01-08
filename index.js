require("./js_modules/ConsoleColor.js").NewLog(console);
const discordBot = require("./js_modules/discordBOT.js");
const keySender = require("./js_modules/keysender.js");
discordBot.keySender_OnNewMessage = keySender.OnNewMessage.bind(keySender);