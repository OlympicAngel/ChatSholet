require("./js_modules/ConsoleColor.js").NewLog(console);
const discordBot = require("./js_modules/discordBOT.js");
const keySender = require("./js_modules/keysender.js");
discordBot.keySender_OnNewMessage = keySender.OnNewMessage.bind(keySender);


process.stdin.resume(); //so the program will not close instantly

function exitHandler(options, exitCode) {
    keySender.closeBOT();
    setTimeout(() => {
        if (options.exit) process.exit();
    }, 300);
}

//do something when app is closing
process.on('exit', exitHandler.bind(null, {
    exit: true
}));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {
    exit: true
}));

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, {
    exit: true
}));
process.on('SIGUSR2', exitHandler.bind(null, {
    exit: true
}));