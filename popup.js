var site = localStorage['site'];
console.log(site);

document.getElementById('site').value = site;

var tags = document.getElementsByTagName('a');
for (var i = tags.length - 1; i >= 0; i--) {
    tags[i].addEventListener('click', function(e) {
        console.log(this.id);
        e.preventDefault();
        requestWindow(this.id);
    });
};

function requestWindow(id) {
    var site = document.getElementById('site').value;

    localStorage['site'] = site;
    console.log(site);

    chrome.runtime.sendMessage({
        createWindow: true,
        params: {
            device: id,
            site: site
        }
    }, function(response) {
        console.log(response.farewell);
    });
}

