site = localStorage['site']

$site = document.getElementById 'site'
$site.value = site

links = document.getElementsByTagName 'a'

submit = document.getElementById 'submit'

submit.addEventListener 'click', (e) ->
    e.preventDefault()
    checkedDevices = document.querySelectorAll '.checkbox:checked'

    values = []
    for device in checkedDevices
        values.push device.value
    createWindow values

for link in links
    link.addEventListener 'click', (e) ->
        e.preventDefault()
        createWindow this.id

createWindow = (ids) ->
    site = $site.value
    localStorage['site'] = site;

    chrome.runtime.sendMessage {
        createWindow: true,
        params: {
            devices: ids,
            site: site
        }
    }, (response) ->
        console.log response.farewell

