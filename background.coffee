protocolVersion = '1.0';

devices = [
    {
        name: 'highend',
        metrics: {
            width: 320,
            height: 2000,
            fontScaleFactor: 1,
            fitWindow: false
        }, 
        ua: {
            userAgent: 'Mozilla/5.0 (iPhone; U; CPU iPhone OS 4_0 like Mac OS X; en-us) 
                AppleWebKit/532.9 (KHTML, like Gecko) Version/4.0.5 Mobile/8A293 Safari/6531.22.7'
        }
    },
    {
        name: 'touch',
        metrics: {
            width: 320,
            height: 2000,
            fontScaleFactor: 1,
            fitWindow: false
        }, 
        ua: {
            userAgent: 'Mozilla/5.0 (SymbianOS/9.4; Series60/5.0 NokiaN97-1/12.0.024; 
                Profile/MIDP-2.1 Configuration/CLDC-1.1; en-us) AppleWebKit/525 
                (KHTML, like Gecko) BrowserNG/7.1.12344'
        }
    },
    { 
        name: 'smart',
        metrics: {
            width: 240,
            height: 2000,
            fontScaleFactor: 1,
            fitWindow: false
        },
        ua: {
            userAgent: 'Mozilla/5.0 (SymbianOS/9.2; U; Series60/3.1 NokiaN95/10.0.010; 
                Profile/MIDP-2.0 Configuration/CLDC-1.1 ) AppleWebKit/413 (KHTML, 
                like Gecko) Safari/413 (383; MSIE 7.0; Windows NT 5.1; .NET CLR 2.0.507'
        }
    },
    { 
        name: 'feature',
        metrics: {
            width: 128,
            height: 2000,
            fontScaleFactor: 1,
            fitWindow: false
        },
        ua: {
            userAgent: 'Nokia1680c-2/2.0 (05.61) Profile/MIDP-2.1 Configuration/CLDC-1.1'
        }
    }
]

localStorage['devices'] = JSON.stringify devices

openDevices = []

getDeviceInfo = (name) ->
    devices = JSON.parse localStorage['devices']
    return device for device in devices when device.name == name

calculateLeftOffset = ->
    left = 0
    for device in openDevices
        left += device.metrics.width
    return left

createDeviceWindow = (params) ->
    console.log 'creating device'

    device = getDeviceInfo params.device
    site = params.site

    leftOffset = calculateLeftOffset()
    width = device.metrics.width

    reloaded = false

    cookie = {
        url: 'http://m.globo.com/',
        name: 'devicegate.client'
    }

    windowData = {
        url: 'http://' + site + '/',
        type: 'popup',
        left: leftOffset + (20 * (openDevices.length + 1)),
        top: 0,
        width: device.metrics.width,
        height: device.metrics.height
    }

    # Create new window as popup and navigate to given url
    chrome.windows.create windowData, (crWindow) ->
        tab = tabId: crWindow.tabs[0].id

        device.tab = tab

        openDevices.push device

        # Set user agent and viewport dimensions only after
        # page is fully loaded. Reload page afterwards.
        chrome.tabs.onUpdated.addListener (tabId, info) ->
            # Ignore other tabs
            if tabId != tab.tabId
                return

            if info.status == "complete" and !reloaded
                console.log 'Page load complete for tab ' + tab.tabId

                chrome.cookies.remove cookie, (response) ->
                    # Attach debugger
                    chrome.debugger.attach tab, protocolVersion, 
                    () ->
                        console.log chrome.runtime.lastError.message if chrome.runtime.lastError

                        # Enable network commands
                        chrome.debugger.sendCommand tab, "Network.enable", {},
                        (response) ->
                            console.log chrome.runtime.lastError.message if chrome.runtime.lastError

                            # Override user agent string
                            chrome.debugger.sendCommand tab, "Network.setUserAgentOverride", device.ua,
                            (response) ->
                                console.log chrome.runtime.lastError.message if chrome.runtime.lastError

                                # Set viewport dimensions
                                chrome.debugger.sendCommand tab, "Page.setDeviceMetricsOverride", device.metrics, 
                                (response) ->
                                    console.log chrome.runtime.lastError.message if chrome.runtime.lastError

                                    chrome.debugger.sendCommand tab, "Page.reload", { ignoreCache: true },
                                    () ->
                                        console.log 'Reloading tab ' + tab.tabId
                                        # Stop reload loop
                                        reloaded = true

chrome.runtime.onMessage.addListener (request, sender, sendResponse) ->
    createDeviceWindow(request.params) if request.createWindow