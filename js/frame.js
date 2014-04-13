var gui = require('nw.gui');
var win = gui.Window.get();

$('#frame-btn-min').on('click', function () {
    win.minimize();
});

$('#frame-btn-close').on('click', function () {
    win.close();
});

gui.App.on('open', function(path) {
	/* Why would anyone need it? Buggy TODO modal to ask what to do
	gui.App.argv[0]=path.split(" ")[1];
	gui.Window.open('index.html', {
		"frame": false,
		"toolbar": false,
		"title" : "thermorrent",
		"min_width": 768,
		"width": 768,
		"height": 540,
		"position" : "mouse",
		"focus" : true
	});
	*/
});