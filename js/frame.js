var gui = require('nw.gui');
var win = gui.Window.get();

$('#frame-btn-min').on('click', function () {
    win.minimize();
});

$('#frame-btn-close').on('click', function () {
    win.close();
});

onload = function() {
  win.show();
}