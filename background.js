var protocolVersion = '1.0';

var devices = [
    {
        name: 'highend',
        metrics: {
            width: 320,
            height: 600,
            fontScaleFactor: 1,
            fitWindow: false
        }, 
        ua: {
            userAgent: 'Mozilla/5.0 (iPhone; U; CPU iPhone OS 4_0 like Mac OS X; en-us) '
                + 'AppleWebKit/532.9 (KHTML, like Gecko) Version/4.0.5 Mobile/8A293 Safari/6531.22.7'
        }
    },
    {
        name: 'touch',
        metrics: {
            width: 320,
            height: 600,
            fontScaleFactor: 1,
            fitWindow: false
        }, 
        ua: {
            userAgent: 'Mozilla/5.0 (SymbianOS/9.4; Series60/5.0 NokiaN97-1/12.0.024; '
                + 'Profile/MIDP-2.1 Configuration/CLDC-1.1; en-us) AppleWebKit/525 '
                + '(KHTML, like Gecko) BrowserNG/7.1.12344'
        }
    },
    { 
        name: 'smart',
        metrics: {
            width: 240,
            height: 600,
            fontScaleFactor: 1,
            fitWindow: false
        },
        ua: {
            userAgent: 'Mozilla/5.0 (SymbianOS/9.2; U; Series60/3.1 NokiaN95/10.0.010; '
                + 'Profile/MIDP-2.0 Configuration/CLDC-1.1 ) AppleWebKit/413 (KHTML, '
                + 'like Gecko) Safari/413 (383; MSIE 7.0; Windows NT 5.1; .NET CLR 2.0.507'
        }
    },
    { 
        name: 'feature',
        metrics: {
            width: 128,
            height: 600,
            fontScaleFactor: 1,
            fitWindow: false
        },
        ua: {
            userAgent: 'Nokia1680c-2/2.0 (05.61) Profile/MIDP-2.1 Configuration/CLDC-1.1'
        }
    }
];

localStorage['devices'] = JSON.stringify(devices);

var openDevices = [];

function getDeviceInfo(name) {
    var device;
    JSON.parse(localStorage['devices']).forEach(function(deviceData) {
        console.log(deviceData);
        if(deviceData.name == name) {
            console.log('found');
            device = deviceData;
        }
    });
    return device;
}

function calculateLeftOffset() {
    var offset = 0;

    openDevices.forEach(function(device) {
        offset += device.metrics.width;
    });

    return offset;
}

function createDeviceWindow(params) {
    console.log('creating device');

    var device = getDeviceInfo(params.device);
    var site = params.site;
    console.log(site);

    var leftOffset = calculateLeftOffset();
    var width = device.metrics.width;

    var reloaded = false;

    // Create new window as popup and navigate to given url
    chrome.windows.create({
        url: 'http://' + site + '/',
        type: 'popup',
        left: leftOffset,
        top: 0,
        width: width,
        height: 600
    }, function(crWindow) {
        // Get id of created tab for manipulating it
        var tabId = crWindow.tabs[0].id;

        device.tabId = tabId;

        openDevices.push(device);

        // Listen for page to be fully loaded
        chrome.tabs.onUpdated.addListener(function(tab, info) {
            // This is called on all tabs so ignore other tabs
            if(tab !== tabId) return;

            if(info.status == "complete" && !reloaded) {
                console.log('Page loaded!');

                chrome.cookies.remove({
                    url: 'http://m.globo.com/',
                    name: 'devicegate.client'
                }, function() {
                    // Attach debugger
                    chrome.debugger.attach({
                        tabId: tabId
                    }, protocolVersion, function() {
                        if(chrome.runtime.lastError) {
                            console.log(chrome.runtime.lastError.message);
                            return;
                        }

                        // Enable network commands
                        chrome.debugger.sendCommand({
                            tabId: tabId
                        }, "Network.enable", {}, function(response) {
                            if(chrome.runtime.lastError) {
                                console.log(chrome.runtime.lastError.message);
                                return;
                            }

                            chrome.debugger.sendCommand({
                                tabId: tabId
                            }, "Network.setUserAgentOverride", device.ua, 
                            function(response) {
                                if(chrome.runtime.lastError) {
                                    console.log(chrome.runtime.lastError.message);
                                    return;
                                }

                                // Set viewport dimensions
                                chrome.debugger.sendCommand({
                                    tabId: tabId
                                }, "Page.setDeviceMetricsOverride", device.metrics, 
                                function(response) {
                                    if(chrome.runtime.lastError) {
                                        console.log(chrome.runtime.lastError.message);
                                        return;
                                    }

                                    chrome.debugger.sendCommand({
                                        tabId: tabId
                                    }, "Page.reload", {
                                        ignoreCache: true
                                    }, function() {
                                        console.log('ima reload');
                                        reloaded = true;
                                    });  
                                }); // metrics
                            }); // ua
                        });  // network
                    }); //debugger
                }); // cookie
            }
        });
    }); // window
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if(request.createWindow) {
        createDeviceWindow(request.params);
    }
});