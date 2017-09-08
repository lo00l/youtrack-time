var UIManager = function(element) {
    this.container = element;
    this.authBlock = null;
    this.issuesBlock = null;
    this.actionBlock = null;
    this.summaryBlock = null;
    this.issueName = null;
    this.events = {};
    var loadingBlock = document.createElement("div");
    loadingBlock.className = "block loading";
	this.container.appendChild(loadingBlock);
}

UIManager.prototype.showNotAuthorized = function() {
	this.clearContainer(false);
	if (!this.authBlock) {
		this.createAuthBlock();
	}
	this.container.appendChild(this.authBlock);
}

UIManager.prototype.initUi = function(userName, issueName) {
	this.clearContainer(false);
	this.setUserName(userName);
	this.addIssuesBlock();
	if (issueName) {
		this.addActionBlock();
		this.setIssueName(issueName);
	}
	this.addSummaryBlock();
}

UIManager.prototype.createAuthBlock = function() {
	this.authBlock = document.createElement("div");
	this.authBlock.className = "block no-auth";
	var divText = document.createElement("div");
	divText.innerText = "Необходимо авторизоваться";
	this.authBlock.appendChild(divText);
}

UIManager.prototype.addIssuesBlock = function() {
	this.issuesBlock = document.createElement("div");
	this.issuesBlock.className = "block";
	var divHeader = document.createElement("div");
	divHeader.className = "header";
	divHeader.innerText = "Время за " + this.getDateStr();
	this.issuesBlock.appendChild(divHeader);
	this.issuesList = document.createElement("il");
	this.issuesList.className = "issues-list";
	this.issuesBlock.appendChild(this.issuesList);
	this.container.appendChild(this.issuesBlock);
}

UIManager.prototype.addActionBlock = function() {
	this.actionBlock = document.createElement("div");
	this.actionBlock.className = "block";
	var divHeader = document.createElement("div");
	divHeader.className = "header";
	this.actionBlock.appendChild(divHeader);
	var form = document.createElement("form");
	form.className = "issue-add";
	var inputText = document.createElement("input");
	inputText.type = "text";
	form.appendChild(inputText);
	var inputSubmit = document.createElement("input");
	inputSubmit.type = "submit";
	inputSubmit.value = "Добавить";
	form.appendChild(inputSubmit);
	form.addEventListener("submit", this.fireEvent.bind(this, "ADD", inputText.value));
	this.actionBlock.appendChild(form);
	this.container.appendChild(this.actionBlock);
}

UIManager.prototype.addSummaryBlock = function() {
	this.summaryBlock = document.createElement("div");
	this.summaryBlock.className = "block";
	var divSummary = document.createElement("div");
	divSummary.className = "summary";
	var divTotal = document.createElement("div");
	divTotal.innerText = "Суммарное время за сегодня: ";
	this.totalTime = document.createElement("b");
	divTotal.appendChild(this.totalTime);
	var divRemain = document.createElement("div");
	divRemain.innerText = "Осталось поставить: ";
	this.remainTime = document.createElement("b");
	divRemain.appendChild(this.remainTime);
	divSummary.appendChild(divTotal);
	divSummary.appendChild(divRemain);
	this.summaryBlock.appendChild(divSummary);
	var divSet = document.createElement("div");
	divSet.className = "set-tracker";
	var buttonSet = document.createElement("button");
	buttonSet.innerText = "Поставить время в трекер";
	buttonSet.addEventListener("click", this.fireEvent.bind(this, "SET"));
	divSet.appendChild(buttonSet);
	this.summaryBlock.appendChild(divSet);
	this.container.appendChild(this.summaryBlock);
}

UIManager.prototype.createIssuesListBlock = function() {
	var dibBlock = document.createElement("div");

}

UIManager.prototype.clearContainer = function() {
	this.container.innerHTML = "";
}

UIManager.prototype.setUserName = function(userName) {
	var divUserName = this.container.querySelector(".user-name");
	if (!divUserName) {
		divUserName = document.createElement("div");
		divUserName.className = "user-name";
		if (this.container.firstChild) {
			this.container.insertBefore(divUserName, this.container.firstChild);
		} else {
			this.container.appendChild(divUserName);
		}
	}
	divUserName.innerText = userName;
}

UIManager.prototype.setIssueName = function(issueName) {
	this.issueName = issueName;
	this.actionBlock.querySelector(".header").innerText = "Поставить время в задачу " + issueName;
}

UIManager.prototype.getDateStr = function() {
    var date = new Date();
    var day = String(date.getDate()).padStart(2, "0");
    var month = String(date.getMonth() + 1).padStart(2, "0");
    var year = date.getFullYear();
    return day + "." + month + "." + year;
}

UIManager.prototype.fireEvent = function(eventName) {
	switch (eventName) {
		case "ADD":
			var event = arguments[arguments.length - 1];
			event.preventDefault();
			var strTime = this.actionBlock.querySelector("input[type=text]").value;
			var args = [strTime];
			break;
		case "EDIT":
			var issueName = arguments[1];
			var strTime = this.issuesList.querySelector("#work-item-" + issueName + " input").value;
			var args = [issueName, strTime];
			break;
		case "REMOVE":
			var issueName = arguments[1];
			var args = [issueName];
			break;
		case "SET":
			var args = [];
			break;
		case "ISSUE-CLICK":
			var issueName = arguments[1];
			var args = [issueName];
	}
	if (this.events[eventName]) {
		this.events[eventName].apply(null, args);
	}
}

UIManager.prototype.setIssues = function(issues) {
	if (issues.length == 0) {
		this.showNoIssues();
	} else {
		this.issuesList.innerHTML = "";
		issues.forEach(function(issue, index) {
			this.addIssue(issue.name, issue.time, issue.set, index);
		}.bind(this));
	}
}

UIManager.prototype.addIssue = function(issueName, strTime, set, issueIndex) {
	var liNode = document.createElement("li");
    liNode.className = "issue" + (issueIndex % 2 == 1 ? " bg" : "") + (this.issueName == issueName ? " active" : "") + (set ? " set" : "");
    liNode.id = "work-item-" + issueName;
    var nameNode = document.createElement("div");
    nameNode.className = "issue-name";
    nameNode.innerText = issueName;
    nameNode.addEventListener("click", this.fireEvent.bind(this, "ISSUE-CLICK", issueName));
    liNode.appendChild(nameNode);
    var timeNode = document.createElement("div");
    timeNode.className = "issue-time";
    var input = document.createElement("input");
    input.type = "text";
    input.value = strTime;
    input.addEventListener("focus", function() {
        this.select();
    });
    input.addEventListener("keydown", function(issueName, event) {
        switch (event.keyCode) {
            case 13:
                event.target.blur();
                break;
            case 27:
                event.preventDefault();
                event.target.value = "";
                event.target.blur();
                break;
        }
    }.bind(this, issueName));
    input.addEventListener("blur", this.fireEvent.bind(this, "EDIT", issueName));
    timeNode.appendChild(input);
    liNode.appendChild(timeNode);
    var removeNode = document.createElement("div");
    removeNode.className = "issue-remove";
    var btnRemove = document.createElement("button");
    btnRemove.dataset.workItemId = issueName;
    btnRemove.addEventListener("click", this.fireEvent.bind(this, "REMOVE", issueName));
    removeNode.appendChild(btnRemove);
    liNode.appendChild(removeNode);
    this.issuesList.appendChild(liNode);
}

UIManager.prototype.showNoIssues = function() {
	this.issuesList.innerHTML = "";
	var liNode = document.createElement("li");
    liNode.className = "no-items";
    liNode.innerText = "Нет единиц работы за сегодня";
    this.issuesList.appendChild(liNode);
}

UIManager.prototype.setEvents = function(events) {
	this.events = events;
}

UIManager.prototype.clearAddInput = function() {
	this.actionBlock.querySelector("input[type=text]").value = "";
	this.actionBlock.querySelector("input[type=text]").blur();
}

UIManager.prototype.focusAddInput = function() {
	this.actionBlock.querySelector("input[type=text]").focus();
}

UIManager.prototype.setSummary = function(totalTime, remainTime) {
	this.totalTime.innerText = totalTime;
	this.remainTime.innerText = remainTime;
}