var UIManager = function(element) {
    this.container = element;
    this.authBlock = null;
    this.issuesBlock = null;
    this.actionBlock = null;
    this.summaryBlock = null;
}

UIManager.prototype.showNotAurhorized = function() {
	this.clearContainer(false);
	if (!this.authBlock) {
		this.createAuthBlock();
	}
	this.container.appendChild(this.authBlock);
}

UIManager.prototype.initUi = function(userName) {
	this.clearContainer(false);
	this.setUserName(userName);
	this.addIssuesBlock();
	this.addActionBlock();
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
	form.addEventListener("submit", this.fireEvent.bind(this, "ADD"));
	this.actionBlock.appendChild(form);
	this.container.appendChild(this.actionBlock);
}

UIManager.prototype.addSummaryBlock = function() {
	this.summaryBlock = document.createElement("div");
	this.summaryBlock.className = "block";
	var divSummary = document.createElement("div");
	divTotal.className = "summary";
	var divTotal = document.createElement("div");
	divTotal.innerText = "Суммарное время за сегодня: ";
	this.totalTime = document.createElement("b");
	divTotal.appendChild(this.totalTime);
	var divRemain = document.createElement("div");
	this.divRemain.innerText = "Осталось поставить: ";
	this.remainTime = document.createElement("b");
	divRemain.appendChild(this.remainTime);
	divSummary.appendChild(divTotal);
	divSummary.appendChild(divRemain);
	this.summaryBlock.appendChild(divSummary);
	var divSet = document.createElement("div");
	divSet.className = "set-tracker";
	var buttonSet = document.createElement("button");
	buttonSet.addEventListener("click", this.fireEvent.bind(this, "SET"));
	divSet.appendChild(buttonSet);
	this.summaryBlock.appendChild(divSet);
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

UIManager.prototype.getDateStr = function() {
    var date = new Date();
    var day = String(date.getDate()).padStart(2, "0");
    var month = String(date.getMonth() + 1).padStart(2, "0");
    var year = date.getFullYear();
    return day + "." + month + "." + year;
}