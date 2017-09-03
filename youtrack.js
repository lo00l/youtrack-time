var Youtrack = function() {
    this.hostName = "https://hungl.myjetbrains.com/youtrack";
    this.formAdd = document.querySelector(".issue-add");
    this.inputAdd = document.querySelector(".issue-add input");
    this.formAdd.addEventListener("submit", this.addTime.bind(this));
    this.btnSetTime = document.querySelector(".set-tracker button");
    this.btnSetTime.addEventListener("click", this.setTime.bind(this));
    this.list = document.querySelector(".issues-list");
    document.querySelector("h1").innerText = "Время за " + this.getDateStr();
    chrome.storage.local.get(this.getMidnightTimestamp(), this.setWorkItems.bind(this));
    this.setCurrentIssueName();
    this.inputAdd.focus();
};

Youtrack.prototype.setWorkItems = function(items) {
    console.log(items);
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
        console.log(xml);
    });
}

Youtrack.prototype.setTime = function() {
    var itemsKeys = Object.keys(this.workItems);
    this.sendTime(itemsKeys[0], this.workItems[itemsKeys[0]], this.onTimeSent.bind(this, 0));
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

Youtrack.prototype.addTime = function(event) {
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
    this.updateList();
    this.syncData();
}

Youtrack.prototype.addNoItemsNode = function() {
    var liNode = document.createElement("li");
    liNode.className = "no-items";
    liNode.innerText = "Нет единиц работы за сегодня";
    this.list.appendChild(liNode);
}

Youtrack.prototype.addWorkItemNode = function(issueName, duration) {
    var liNode = document.createElement("li");
    liNode.className = "issue" + (this.getWorkItemsCount() % 2 == 0 ? " bg" : "");
    liNode.id = "work-item-" + issueName;
    var nameNode = document.createElement("span");
    nameNode.className = "issue-name";
    nameNode.innerText = issueName;
    liNode.appendChild(nameNode);
    var timeNode = document.createElement("span");
    timeNode.className = "issue-time";
    timeNode.innerText = this.encodeTime(duration);
    liNode.appendChild(timeNode);
    var removeNode = document.createElement("span");
    removeNode.className = "issue-remove";
    var btnRemove = document.createElement("button");
    btnRemove.dataset.workItemId = issueName;
    btnRemove.addEventListener("click", this.removeWorkItem.bind(this));
    removeNode.appendChild(btnRemove);
    liNode.appendChild(removeNode);
    this.list.appendChild(liNode);
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
    if (hoursCount == 0 && minutesCount == 0) {
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
    this.updateList();
    this.syncData();
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

Youtrack.prototype.updateList = function() {
    document.querySelectorAll(".issues-list li").forEach(function(node) {
        this.list.removeChild(node);
    }.bind(this));
    if (Object.keys(this.workItems).length == 0) {
        this.addNoItemsNode();
    } else {
        for (var issueName in this.workItems) {
            this.addWorkItemNode(issueName, this.workItems[issueName]);
        }
    }
    
    // this.workItems.forEach(function(workItem) {
    //     this.addWorkItemNode(workItem);
    // }.bind(this));
    document.getElementById("total-time").innerText = this.encodeTotalTime(this.getTotalDuration());
    document.getElementById("remain-time").innerText = this.encodeTotalTime(480 - this.getTotalDuration());
}

Youtrack.prototype.setCurrentIssueName = function() {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function(tabs) {
        var currentTabUrl = tabs[0].url;
        var matches = currentTabUrl.match(/[a-zA-Z]+[-]\d+/);
        if (matches.length > 0) {
            this.issueName = matches[0];
            document.querySelector(".issue-add span").innerText = matches[0];
        }
    }.bind(this));
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