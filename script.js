var y = new Youtrack();

// chrome.tabs.query({
//     active: true,
//     currentWindow: true
// }, function(tabs) {
//     var currentTabUrl = tabs[0].url;
//     var matches = currentTabUrl.match(/[a-zA-Z]+[-]\d+/);
//     if (matches.length > 0) {
//         var url = "https://hungl.myjetbrains.com/youtrack/rest/issue/" + matches[0] + "/timetracking/workitem";
//         fetch(url, {
//             credentials: "include"
//         })
//         .then(r => r.text())
//         .then(text => (new window.DOMParser()).parseFromString(text, "text/xml"))
//         .then(function(xml) {
//             console.log(xml);
//         });
//     }
// });