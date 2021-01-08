const colors = require('cli-color');

module.exports = {
    NewLog: function (newConsole) {
        newConsole.oldLog = newConsole.log;
        newConsole.log = function (str) {
            if (str == undefined)
                str = "";
            if (str.toString().indexOf("]:") != -1 &&
                str.toString().indexOf("[") != -1) {
                let prefixColor = colors.whiteBright;
                let textColor = colors.blackBright;
                var prefix = str.split("]:")[0].substring(1, 999);
                switch (prefix.toLowerCase()) {
                    case "discordbot":
                        prefixColor = colors.bgMagentaBright;
                        textColor = colors.magentaBright;
                        break;
                    case "localhost":
                        prefixColor = colors.yellowBright;
                        textColor = colors.white;
                        break;
                    case "settings_ws":
                        prefixColor = colors.cyanBright;
                        break;

                }
                prefix = prefixColor("[" + prefix + "]:");
                let rest = textColor(str.split("]:")[1]);
                newConsole.oldLog(prefix + rest);
            } else
                newConsole.oldLog(colors.red(str));
        }
    }
};