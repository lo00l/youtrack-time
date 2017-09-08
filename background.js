chrome.runtime.onInstalled.addListener(function() {
    // chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    //     chrome.declarativeContent.onPageChanged.addRules([{
    //         conditions: [
    //             new chrome.declarativeContent.PageStateMatcher({
    //                 pageUrl: {
    //                     //urlContains: "https://hungl.myjetbrains.com/youtrack/issue/"
    //                     urlContains: "https://support.webcenter.pro/youtrack"
    //                 }
    //             })
    //         ],
    //         actions: [new chrome.declarativeContent.ShowPageAction()]
    //     }]);
    // });


    chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tabs) {
        var d = new Date();
        d.setHours(0, 0, 0, 0);
        var midnightTimestamp = String(d.getTime());
        chrome.storage.local.get("total" + midnightTimestamp, function(data) {
            var totalTime = data['total' + midnightTimestamp] || 60;
            var canvas = document.createElement("canvas");
            canvas.width = 32;
            canvas.height = 32;
            var ctx = canvas.getContext("2d");
            var img = new Image();
            img.src = "images/icon.png";
            img.onload = function() {
                var totalTimePixels = Math.round(32 * (totalTime / 480));
                ctx.drawImage(img, 0, 0);
                ctx.fillStyle = "#DD2C00";
                ctx.lineWidth = 1;
                ctx.fillRect(0, 26, totalTimePixels, 12);
                chrome.browserAction.setIcon({
                    tabId: tabId,
                    imageData: ctx.getImageData(0, 0, 32, 32)
                });
            }
        });
    });
});

