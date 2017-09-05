var Youtrack = function(hostName) {
    this.ui = new UIManager(document.querySelector(".main"));
    this.hostName = hostName;
    this.getUser(function(userName) {
        if (userName) {
            this.getCurrentIssueName(function(issueName) {
                console.log(userName, issueName);
                if (issueName) {
                    this.ui.initUi(userName, issueName);
                    this.setUiEvents();
                    chrome.storage.local.get(this.getMidnightTimestamp(), function(issues) {
                        this.ui.setIssues(issues[this.getMidnightTimestamp()]);
                    }.bind(this));
                } else {
                    this.ui.initUi(userName);
                }
            }.bind(this));
        } else {
            this.ui.showNotAuthorized();
        }
    }.bind(this));
};

Youtrack.prototype.setUiEvents = function() {
    this.ui.setEvents({
        ADD: this.addTime.bind(this),
        EDIT: this.editTime.bind(this),
        REMOVE: this.removeTime.bind(this),
        SET: this.setTime.bind(this)
    })
}

Youtrack.prototype.addTime = function(strTime) {
    console.log("addTime", strTime);
    var addDuration = this.decodeTime(strTime);
    if (addDuration === false) {
        return;
    }
    var currentDuration = this.workItems[this.issueName] || 0;
    currentDuration += addDuration;
    this.workItems[this.issueName] = currentDuration;
    this.ui.setIssues(this.workItems);
}

Youtrack.prototype.editTime = function(issueName, strTime) {
    console.log("editTime", issueName, strTime);
}

Youtrack.prototype.removeTime = function(issueName) {
    console.log("removeTime", issueName);
}

Youtrack.prototype.setTime = function() {
    console.log("setTime");
}

Youtrack.prototype.onListUpdated = function(event) {
    this.updateList();
    this.syncData();
}

Youtrack.prototype.setWorkItems = function(items) {
    this.workItems = items[this.getMidnightTimestamp()] || {};
    this.updateList();
}

Youtrack.prototype.getUser = function(callback)
{
    fetch(this.hostName + "/rest/user/current", {
        credentials: "include",
        headers: {
            "Access-Control-Allow-Origin": "*"
        }
    })
    .then(r => r.text())
    .then(str => (new window.DOMParser().parseFromString(str, "text/xml")))
    .then(function(xml) {
        var fullName = xml.getElementsByTagName("user")[0].getAttribute("fullName");
        callback(fullName);
    });
}

Youtrack.prototype.sendTime = function(issueName, duration, callback) {
    var url = this.hostName + "/rest/issue/" + issueName + "/timetracking/workitem";
    var requestBody = "<workItem><duration>" + duration + "</duration></workItem>";
    fetch(url, {
        credentials: "include",
        method: "POST",
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/xml"
        },
        body: requestBody
    })
    .then(r => r.text())
    .then(str => (new window.DOMParser().parseFromString(str, "text/xml")))
    .then(function(xml) {
        callback(issueName, duration);
    });
}

Youtrack.prototype.onTimeSent = function(itemIndex, issueName, duration) {
    document.getElementById("work-item-" + issueName).style.backgroundColor = "#B39DDB";
    var itemsKeys = Object.keys(this.workItems);
    if (itemIndex < itemsKeys.length - 1) {
        this.sendTime(itemsKeys[itemIndex + 1], this.workItems[itemsKeys[itemIndex + 1]], 
            this.onTimeSent.bind(this, itemIndex + 1)
        );
    }
}

/*Youtrack.prototype.addTime = function(event) {
    event.preventDefault();
    console.log(this.decodeTime(this.inputAdd.value));
    var addDuration = this.decodeTime(this.inputAdd.value);
    if (addDuration === false) {
        return;
    }
    var currentDuration = this.workItems[this.issueName] || 0;
    currentDuration += addDuration;
    this.workItems[this.issueName] = currentDuration;
    this.inputAdd.value = "";
    document.dispatchEvent(new Event("listUpdated"));
}*/

Youtrack.prototype.setDuration = function(issueName) {
    console.log("setDuration", issueName);
    var duration = this.decodeTime(document.querySelector("#work-item-" + issueName + " input[type=text]").value);
    if (duration !== false) {
        this.workItems[issueName] = duration;
    }
    document.dispatchEvent(new Event("listUpdated"));
}

Youtrack.prototype.getWorkItemsCount = function() {
    return document.querySelectorAll(".issues-list li").length;
}

Youtrack.prototype.encodeTime = function(duration) {
    var weeksCount = Math.floor(duration / 40 / 60);
    var daysCount = Math.floor((duration - weeksCount * 40 * 60) / 8 / 60);
    var hoursCount = Math.floor((duration - weeksCount * 40 * 60 - daysCount * 8 * 60) / 60);
    var minutesCount = duration % 60;
    return (!!weeksCount ? weeksCount + "н" : "")
         + (!!daysCount ? daysCount + "д" : "")
         + (!!hoursCount ? hoursCount + "ч" : "")
         + (!!minutesCount ? minutesCount + "м" : "");
}

Youtrack.prototype.decodeTime = function(str) {
    str = str.replace("l", "д").replace("x", "ч").replace("v", "м");
    var daysMatch = str.match(/(\d+)д/);
    if (daysMatch) {
        var daysCount = +daysMatch[1];
    } else {
        daysCount = 0;
    }
    var hoursMatch = str.match(/(\d+)ч/);
    if (hoursMatch) {
        var hoursCount = +hoursMatch[1];
    } else {
        hoursCount = 0;
    }
    var minutesMatch = str.match(/(\d+)м/);
    if (minutesMatch) {
        var minutesCount = +minutesMatch[1];
    } else {
        minutesCount = 0;
    }
    var time = daysCount * 60 * 8 + hoursCount * 60 + minutesCount;
    return time > 0 ? time : false;
}

Youtrack.prototype.encodeTotalTime = function(duration) {
    var hoursCount = Math.floor(duration / 60);
    var minutesCount = duration % 60;
    if (hoursCount < 0 && minutesCount < 0) {
        return "0 минут";
    }
    return (!!hoursCount ? (hoursCount + " час" + this.getWordEnding(hoursCount, ["", "ов", "а"]) + " ") : "")
         + (!!minutesCount ? (minutesCount + " минут" + this.getWordEnding(minutesCount, ["а", "", "ы"])) : "");
}

Youtrack.prototype.getWordEnding = function(count, endings) {
    if (count % 10 == 1 && count != 11) {
        return endings[0];
    }
    if (Math.floor(count / 10) == 1 || count % 10 >= 5 && count % 10 <= 9 || count % 10 == 0) {
        return endings[1];
    }
    return endings[2];
}

Youtrack.prototype.removeWorkItem = function(event) {
    var issueName = event.target.dataset.workItemId;
    console.log(issueName, this.workItems);
    delete this.workItems[issueName];
    document.dispatchEvent(new Event("listUpdated"));
}

Youtrack.prototype.getDateStr = function() {
    var date = new Date();
    var day = String(date.getDate()).padStart(2, "0");
    var month = String(date.getMonth() + 1).padStart(2, "0");
    var year = date.getFullYear();
    return day + "." + month + "." + year;
}

Youtrack.prototype.getTotalDuration = function() {
    return Object.values(this.workItems).reduce(function(sum, duration) {
        return sum + duration;
    }, 0);
}

Youtrack.prototype.getCurrentIssueName = function(callback) {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function(tabs) {
        console.log(tabs);
        var currentTabUrl = tabs[0].url;
        var matches = currentTabUrl.match(/[a-zA-Z]+[-]\d+/);
        if (matches) {
            callback(matches[0]);
        } else {
            callback(false);
        }
    });
}

Youtrack.prototype.getMidnightTimestamp = function() {
    var d = new Date();
    d.setHours(0, 0, 0, 0);
    return String(d.getTime());
}

Youtrack.prototype.syncData = function() {
    var midnightTimestamp = this.getMidnightTimestamp();
    var setObject = {};
    setObject[midnightTimestamp] = this.workItems;
    console.log(setObject);
    chrome.storage.local.set(setObject);
}