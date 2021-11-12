var backgroundPageView = chrome.extension.getBackgroundPage();
var button_event;

document.addEventListener('DOMContentLoaded', function () {

  button_event = document.getElementById("btn_event");
  button_event.addEventListener("click", function() {

    // tabID 가져오기 (chrome.tabs.query)
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        var currTab = tabs[0];
        if (currTab) {
            // tabid를 backgroundPage에 저장
            //backgroundPageView.tab_set(currTab.id);
            console.log("Active Tab", currTab.id);
        }
        else
        {
            console.log("cannot get active tab!");
        }
    });
/*
    chrome.tabs.executeScript(null, {
        file: `real_activetab.js`,
        runAt: "document_end"
    }, function (results) {
      console.log("!!results : ", results);
    });
*/
  });
});



