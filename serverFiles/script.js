const pageType = "settings";
var selectedWindow = "";

var $socket = {
    ws: undefined,
    port: "{0}",
    url: undefined,
    responses: {},

    StartListen: function () {
        this.url = 'localhost:' + this.port;
        this.ws = new WebSocket('ws://' + this.url, pageType);
        this.ws.addEventListener('open', this.on.open);
        this.ws.addEventListener("close", this.on.close);
        this.ws.addEventListener('message', this.on.messgae);
    },

    Send: function (data) {
        if (typeof data == "object")
            data = JSON.stringify(data);
        console.log(data)
        this.ws.send(data);
    },
    SendSettings: function (data) {
        this.Send({
            settings: data
        });
    },

    AddResponse: function (action, callback) {
        this.responses[action] = callback;
    },

    on: {
        open: function (e) {
            document.body.removeAttribute("style");
        },
        messgae: function (e) {
            console.log('Message from server ', e.data);
            if (e.data.toString() == "-1") {
                document.body.style.opacity = "0.2";
                document.body.style.backgroundColor = "#cc3333";
                socket.onclose = undefined;
                return setTimeout(() => {
                    alert("החיבור נסגר עקב פתיחת הדף במקום אחר..");
                }, 1)
            }
            var obj = e.data;
            try {
                obj = JSON.parse(obj)
            } catch (e) {
                return console.warn("not object")
            }

            for (let key in obj) {
                if ($socket.responses[key])
                    $socket.responses[key](obj[key]);
            }
        },
        close: function (e) {
            document.body.style.opacity = "0.2";
            document.body.style.backgroundColor = "#cc3333";
            socket = null;
            socketable = false;
            setTimeout($socket.StartListen, 2000);
        }
    },
};
$socket.AddResponse("login", (login) => {
    let elemnt = document.getElementById("obsurltext");
    elemnt.className = (login) ? "done" : "";
})
$socket.AddResponse("wins", (wins) => {
    var gameselect = document.getElementById("games");
    var html = "";
    if (selectedWindow)
        wins[selectedWindow] = 1;

    for (let key in wins) {
        let header = "<option>";
        if (key == selectedWindow)
            header = "<option selected>"
        html += header + key + "</option>"
    }
    gameselect.innerHTML = html;
    gameselect.removeAttribute("disabled");
})
$socket.AddResponse("discordLink", (discordLink) => {
    var win = window.open(discordLink, '_blank');
    win.focus();
})
$socket.AddResponse("conServers", (conServers) => {
    var appendTo = document.getElementById("serversConn");
    var string = "<h6>מחובר ל:</h6>";
    for (var x = 0; x < conServers.length; x++) {
        string += "<span class='server'>" + conServers[x][0] + "<img src='" + conServers[x][1] + "'/></span>";
    }
    if (conServers.length == 0)
        string = "לא מחובר לשום שרת";
    string += "<br><button onclick='$socket.Send({discordLink:1});'>הוספת הבוט לשרת</button>";
    appendTo.innerHTML = string;
})
$socket.AddResponse("discordOn", (isOn) => {
    if (isOn == true) {
        document.body.className = "";

        document.getElementById("onNotLoged").style.display = "none";
        document.getElementById("onLoged").style.display = "block";
        $socket.Send({
            conServers: 1
        });
    } else if (isOn == false) {
        document.body.className = "force";
        document.getElementById("onNotLoged").style.display = "block";
        document.getElementById("onLoged").style.display = "none";
        if (document.getElementById("code").value.length != 0) {

        }
    } else {
        alert(isOn);
    }
});
$socket.AddResponse("settings", (settings) => {
    if (settings.token) {
        document.getElementById("code").value = settings.token;
    }
    if (settings.window)
        selectedWindow = settings.window;
    if (settings.discordChannel)
        document.getElementById("servChannel").value = settings.discordChannel;
    if (settings.lister) {
        if (settings.lister.blackList)
            document.getElementById("blackList").value = settings.lister.blackList.toString();
        if (settings.lister.favoList)
            document.getElementById("whiteList").value = settings.lister.favoList.toString();
    }
    if (settings.keySender) {
        if (settings.keySender.keys)
            document.getElementById("keys").value = settings.keySender.keys.toString().replace(/,/g, ", ");
        if (settings.keySender.alterKeys) {
            let str = [];
            for (key in settings.keySender.alterKeys) {
                str.push(settings.keySender.alterKeys[key] + "=" + key)
            }
            document.getElementById("alterKeys").value = str.toString().replace(/,/g, ", ");
        }
        if (settings.keySender.multipleKeys)
            document.getElementById("multiple").value = settings.keySender.multipleKeys.toString().replace(/,/g, ", ");
        if (settings.keySender.duration)
            document.getElementById("press").value = settings.keySender.duration;
    }
    if (settings.browser != 1) {
        document.getElementById("chrome").style.display = "block";
    }


});
$socket.AddResponse("botData", (brain) => {
    document.getElementById("brain").value = JSON.stringify(brain, null, '\t')
});

function textToObj(elemnt, as, settingJson) {
    elemnt = document.getElementById(elemnt.getAttribute("for"));
    var value = elemnt.value.trim().replace(/ /g, "").replace(/,,/g, ",");
    if (as == "array") {
        value = value.split(",");
        value = value.filter((val) => val != "");
        value = value.filter(function (item, pos, self) {
            return self.indexOf(item) == pos;
        })
        elemnt.value = value.toString().replace(/,/g, ", ");
    } else if (as == "json") {
        let splitArr = value.split(",");
        splitArr = splitArr.filter(function (item, pos, self) {
            return self.indexOf(item) == pos;
        })
        value = {};
        for (let x = 0; x < splitArr.length; x++) {
            if (splitArr[x].indexOf("=") == -1)
                continue;
            let current = splitArr[x].split("=");
            if (current.length != 2 || current[0] == "" || current[1] == "")
                continue;
            value[current[1]] = current[0];
        }
        let str = [];
        for (key in value) {
            str.push(value[key] + "=" + key)
        }
        elemnt.value = str.toString().replace(/,/g, ", ");
    }
    value = JSON.parse(settingJson.replace("null", JSON.stringify(value).trim()));
    $socket.SendSettings(value);
}

function fixInput(elemnt) {
    elemnt.value = Math.max(100, (Math.min(elemnt.value, 10000)));
}

function forceReloadServers() {
    document.getElementById('serversConn').innerHTML = '';
    setTimeout(() => {
        $socket.Send({
            conServers: 1
        });
    }, 200);

    return false;
}

(function () {
    $socket.StartListen();
    document.getElementById("obsurl").value = "http://" + $socket.url + "/show";
})();