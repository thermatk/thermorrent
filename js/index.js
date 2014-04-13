var numeral = require('numeral');
var bytes = function(num) {
	return numeral(num).format('0.0b');
};
var events = require('events');

var statisticInterval;
var playerStarted=false;
var enginestarted=false;
var starter = new events.EventEmitter();

onload = function() {
	if(gui.App.argv[0] && (/torrent/.test(gui.App.argv[0]) || /^magnet:/.test(gui.App.argv[0]))) {
		opentorrent(gui.App.argv[0]);
		gui.App.argv[0]="0";
	}
  	win.show();
}

document.addEventListener('keyup', function (e) {
    if (e.keyCode == 'D'.charCodeAt(0) && e.ctrlKey) {
        debugMode();
    }
});

function debugMode() {
	$("#catalogue").show();
	win.showDevTools();
}
function openfile() {	
	var event = document.createEvent('MouseEvents');
	event.initMouseEvent('click');
	document.getElementById('open_torrent').dispatchEvent(event);
}

document.getElementById('open_torrent').addEventListener('change', function (e) {
	opentorrent(document.getElementById('open_torrent').value);
});

$('#magnetModal').on('shown.bs.modal', function () {
	/* UPSTREAM BUG?
	var gui = global.window.nwDispatcher.requireNwGui();
	var clipboard = gui.Clipboard.get();
	var cliptext = clipboard.get('text');
	$("#magnetLink").val(cliptext);*/
	$("#magnetLink").focus(); 
})

function openmagnet() {
	$('#magnetModal').modal('hide');
	opentorrent($("#magnetLink").val());
}

function stopengine() {
	engine.destroy();
	win.reload();
}

starter.on("enginestarts", switchChooseLoad);

function switchChooseLoad() {
	enginestarted=true;
	$("#choosesource").hide("fast");
	$("#loadandplay").show("fast");

	$("#frame-btn-stat").text("Стриминг запущен");
	$("#frame-btn-stat").removeClass("btn-default").addClass("btn-warning");
	$("#frame-btn-switch").show();
}
starter.on('stat', function(data) {
	$("#magnetstat").hide();
	$("#stattable").show();
	statisticInterval=setInterval(function() {statHandler(data); }, 500);
});

function magnetStat() {
	$("#magnetstat").show();
	$("#magnetstatmeta").text(engine.swarm.wires.length);
}

function statHandler(data) {
	var active = function(wire) {
		return !wire.peerChoking;
	};

	var wires = engine.swarm.wires;
	var swarm = engine.swarm;
	var unchoked = engine.swarm.wires.filter(active);
	var runtime = Math.floor((Date.now() - data.started) / 1000); // time running

	var now = swarm.downloaded,
	total = engine.server.index.length;

	// href - address for player
	// filename - filename that is streaming
	// bytes(swarm.downloadSpeed())+'/s' - speed
	// +unchoked.length +'/'+wires.length+ - connected/available peers
	// +bytes(swarm.downloaded)+ - downloaded
	// +bytes(swarm.uploaded)+ - uploaded
	// +hotswaps+ - hotswaps
	$("#statalreadydownfile").text(bytes(now));
	$("#stattotalfile").text(bytes(total));
	var downpercent = now / total * 100.0;
	$("#statfilebar").width(downpercent+"%");	
	$("#stathref").text(data.href);
	$("#statfilename").text(data.filename);
	$("#statspeed").text(bytes(swarm.downloadSpeed())+'/с');
	$("#statpeers").text(unchoked.length +'/'+wires.length);
	wires.every(function(wire) {
		var tags = [];
		if (wire.peerChoking) tags.push('choked');
		//+wire.peerAddress+''+bytes(wire.downloaded)+''+bytes(wire.downloadSpeed())+'/s'+tags.join(', ')+ - every wire info
		return true;
	});

	var
	// Minimum percentage to open video
	MIN_PERCENTAGE_LOADED = 0.5,
	// Minimum bytes loaded to open video
	MIN_SIZE_LOADED = 10 * 1024 * 1024;
	if (!playerStarted && $("#usevlc").prop("checked")) {
		// There's a minimum size before we start playing the video.
		// Some movies need quite a few frames to play properly, or else the user gets another (shittier) loading screen on the video player.
		var targetLoadedSize = MIN_SIZE_LOADED > total ? total : MIN_SIZE_LOADED,
		targetLoadedPercent = MIN_PERCENTAGE_LOADED * total / 100.0,

		targetLoaded = Math.max(targetLoadedPercent, targetLoadedSize),

		percent = now / targetLoaded * 100.0;
		if (now > targetLoaded) {
		    startvlc(data.href);
			playerStarted = true;
		    $("#vlccheck").hide("fast");
		    $("#vlcbutton").show("fast");
			$("#vlcbar").width("100%");		    
		} else {
			$("#vlcbar").width(percent+"%");
		}
	}
}

/*
Useful code from peerflix/app.js
// Listing files
if (argv.list) {
	var onready = function() {
		engine.files.forEach(function(file, i, files) {
			clivas.line('{3+bold:'+i+'} : {magenta:'+file.name+'}');
		})
		process.exit(0);
	};
	if (engine.torrent) onready();
	else engine.on('ready', onready);
	return;
}
*/