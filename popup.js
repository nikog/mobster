// Generated by CoffeeScript 1.6.3
(function() {
  var $site, createWindow, link, links, site, submit, _i, _len;

  site = localStorage['site'];

  $site = document.getElementById('site');

  $site.value = site;

  links = document.getElementsByTagName('a');

  submit = document.getElementById('submit');

  submit.addEventListener('click', function(e) {
    var checkedDevices, device, values, _i, _len;
    e.preventDefault();
    checkedDevices = document.querySelectorAll('.checkbox:checked');
    values = [];
    for (_i = 0, _len = checkedDevices.length; _i < _len; _i++) {
      device = checkedDevices[_i];
      values.push(device.value);
    }
    return createWindow(values);
  });

  for (_i = 0, _len = links.length; _i < _len; _i++) {
    link = links[_i];
    link.addEventListener('click', function(e) {
      e.preventDefault();
      return createWindow(this.id);
    });
  }

  createWindow = function(ids) {
    site = $site.value;
    localStorage['site'] = site;
    return chrome.runtime.sendMessage({
      createWindow: true,
      params: {
        devices: ids,
        site: site
      }
    }, function(response) {
      return console.log(response.farewell);
    });
  };

}).call(this);
