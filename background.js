chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.method == "clickhandling") {
            //screenAnnotationCompleted(request.params);
            console.log(request.params);
            debugger_dispatchMouseEvent(request.params.parameter);
        }
        return true;
    }
);