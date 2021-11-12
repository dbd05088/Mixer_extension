function injectScript() {
    console.log("Content script tries to inject scripts");
    let injected_script1 = document.createElement('script');
    let injected_script2 = document.createElement('script');

    // 이 아래 url들은 반드시 web_accessible_resources in manifest.json
    injected_script1.src = chrome.runtime.getURL('./injected_script.js');
    injected_script2.src = chrome.runtime.getURL('./MultiStreamMixer.js');

    injected_script1.async = false;
    injected_script2.async = false;
    
    (document.head || document.documentElement).appendChild(injected_script1);
    (document.head || document.documentElement).appendChild(injected_script2);

    injected_script2.onload = _ => {
        console.log("injected!", injected_script3.src);
        window.postMessage({
            destination: 'injected_script.js',
            source: 'content_script.js',
            message: "initInjectedScript",
            localPageId: localPageId,
            remotePageIds: remotePageIds,
            credentials: credentials,
            proxyInterfaceDevices: proxyInterfaceDevices
        }, '*' /* targetOrigin: any */ );
    };
}

console.log("contentScript loaded!!");
injectScript();