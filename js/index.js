var numeral = require('numeral');
var bytes = function(num) {
	return numeral(num).format('0.0b');
};
var events = require('events');

var statisticInterval;
var playerStarted=false;
var starter = new events.EventEmitter();

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
	$('#magnetModal').modal('hide')
	opentorrent($("#magnetLink").val());
}

function stopengine() {
	clearInterval(statisticInterval);
	playerStarted = false;
	engine.destroy();
}

starter.on('stat', function(data) {
	$("#progress").text("Начало качаться!");
	statisticInterval=setInterval(function() {statHandler(data); }, 500);
});

function magnetStat() {
	$("#progress2").text("Получаем метаданные от "+engine.swarm.wires.length+" пиров");
}

function statHandler(data) {
	var active = function(wire) {
		return !wire.peerChoking;
	};

	var wires = engine.swarm.wires;
	var swarm = engine.swarm;
	var unchoked = engine.swarm.wires.filter(active);
	var runtime = Math.floor((Date.now() - data.started) / 1000); // time running

	// href - address for player
	// filename - filename that is streaming
	// bytes(swarm.downloadSpeed())+'/s' - speed
	// +unchoked.length +'/'+wires.length+ - connected/available peers
	// +bytes(swarm.downloaded)+ - downloaded
	// +bytes(swarm.uploaded)+ - uploaded
	// +hotswaps+ - hotswaps
	$("#progress2").text("Ссылка: " + data.href +" Файл: "+data.filename+" Скорость: "+bytes(swarm.downloadSpeed())+'/s'+' Пиры: '+unchoked.length +'/'+wires.length+' Уже скачалось: '+bytes(swarm.downloaded));
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
		var now = swarm.downloaded,
		total = engine.server.index.length,
		// There's a minimum size before we start playing the video.
		// Some movies need quite a few frames to play properly, or else the user gets another (shittier) loading screen on the video player.
		targetLoadedSize = MIN_SIZE_LOADED > total ? total : MIN_SIZE_LOADED,
		targetLoadedPercent = MIN_PERCENTAGE_LOADED * total / 100.0,

		targetLoaded = Math.max(targetLoadedPercent, targetLoadedSize),

		percent = now / targetLoaded * 100.0;
		if (now > targetLoaded) {
            $("#progress").text("VLC открывается и смотреть можно");
		    startvlc(data.href);
			playerStarted = true;
		} else {
        	$("#progress").text("VLC откроется когда скачается 100% первого отрывка: "+percent+"%");
		}
	}
}