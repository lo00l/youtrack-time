var Youtrack = function() {
    this.hostName = "https://hungl.myjetbrains.com/youtrack";
    this.btnAdd = document.querySelector(".issue-add button");
    this.inputAdd = document.querySelector(".issue-add input");
    this.btnAdd.addEventListener("click", this.addTime.bind(this));
    this.list = document.querySelector(".issues-list");
    document.querySelector("h1").innerText = "Время за " + this.getDateStr();
    this.workItems = [
        {
            id: "a1",
            issueName: "dentsupport-123",
            duration: 10
        },
        {
            id: "a2",
            issueName: "pokupalkin-234",
            duration: 100
        },
        {
            id: "a3",
            issueName: "molter-23",
            duration: 30
        },
        {
            id: "a4",
            issueName: "rosservis-2",
            duration: 20
        }
    ];
    this.updateList();
    this.setCurrentIssueName();
};

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

Youtrack.prototype.addTime = function() {
    console.log(this.inputAdd.value);
}

Youtrack.prototype.addWorkItemNode = function(workItem) {
    var liNode = document.createElement("li");
    liNode.className = "issue" + (this.getWorkItemsCount() % 2 == 0 ? " bg" : "");
    liNode.id = "work-item-" + workItem.id;
    var nameNode = document.createElement("span");
    nameNode.className = "issue-name";
    nameNode.innerText = workItem.issueName;
    liNode.appendChild(nameNode);
    var timeNode = document.createElement("span");
    timeNode.className = "issue-time";
    timeNode.innerText = this.encodeTime(workItem.duration);
    liNode.appendChild(timeNode);
    var removeNode = document.createElement("span");
    removeNode.className = "issue-remove";
    var btnRemove = document.createElement("button");
    btnRemove.dataset.workItemId = workItem.id;
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

Youtrack.prototype.decodeTime = function() {
    return 60;
}

Youtrack.prototype.encodeTotalTime = function(duration) {
    var hoursCount = Math.floor(duration / 60);
    var minutesCount = duration % 60;
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
    var workItemId = event.target.dataset.workItemId;
    var liNode = document.getElementById("work-item-" + workItemId);
    this.list.removeChild(liNode);
}

Youtrack.prototype.getDateStr = function() {
    var date = new Date();
    var day = String(date.getDate()).padStart(2, "0");
    var month = String(date.getMonth() + 1).padStart(2, "0");
    var year = date.getFullYear();
    return day + "." + month + "." + year;
}

Youtrack.prototype.getTotalDuration = function() {
    return this.workItems.reduce(function(sum, workItem) {
        return sum + workItem.duration;
    }, 0);
}

Youtrack.prototype.updateList = function() {
    document.querySelectorAll(".issues-list li").forEach(function(node) {
        this.list.removeChild(node);
    }.bind(this));
    this.workItems.forEach(function(workItem) {
        this.addWorkItemNode(workItem);
    }.bind(this));
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
    });
}