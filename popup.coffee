site = localStorage['site']

$site = document.getElementById 'site'
$site.value = site

links = document.getElementsByTagName 'a'

for link in links
    link.addEventListener 'click', (e) ->
        e.preventDefault()
        createWindow this.id

createWindow = (id) ->
    site = $site.value
    localStorage['site'] = site;

    chrome.runtime.sendMessage {
        createWindow: true,
        params: {
            device: id,
            site: site
        }
    }, (response) ->
        console.log response.farewell

