var gui = require('nw.gui');
var win = gui.Window.get();

$('#frame-btn-min').on('click', function () {
    win.minimize();
});

$('#frame-btn-close').on('click', function () {
    win.close();
});

onload = function() {
	if(gui.App.argv[0] && /torrent/.test(gui.App.argv[0])) {
		opentorrent(gui.App.argv[0]);
		gui.App.argv[0]="0";
	}
  	win.show();
}

gui.App.on('open', function(path) {
	/* WHy would anyone need it? Buggy
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