var fs = require('fs');
var peerflix = require('peerflix');
var readTorrent = require('read-torrent');
var address = require('network-address');
var numeral = require('numeral');

function opentorrent(torrent) {
	//debug
	$("#progress").text("Кто-то кликнул кнопку и выбрал торрент!");

	var opts={};
	opts.playvlc=true;

	if (/^magnet:/.test(torrent)) {
		ontorrent(torrent, opts);
	} else {
		readTorrent(torrent, function(err, torrentparsed) {
			if (err) {
				console.error(err.message);
				process.exit(1);
			}
			ontorrent(torrentparsed,opts);
		});
	}

}

var ontorrent = function(torrent, opts) {
	
	if (!opts) {
		opts = {};	
	}
	if (opts.playvlc == undefined) {
		opts.playvlc = false;
	}
	var engine = peerflix(torrent);
	var hotswaps = 0;

	engine.on('hotswap', function() {
		hotswaps++;
	});

	var started = Date.now();
	var wires = engine.swarm.wires;
	var swarm = engine.swarm;

	var active = function(wire) {
		return !wire.peerChoking;
	};

	engine.on('uninterested', function() {
		engine.swarm.pause();
	});

	engine.on('interested', function() {
		engine.swarm.resume();
	});

	engine.server.on('listening', function() {
		var href = 'http://'+address()+':'+engine.server.address().port+'/';
		var filename = engine.server.index.name.split('/').pop().replace(/\{|\}/g, '');


		var bytes = function(num) {
			return numeral(num).format('0.0b');
		};

		$("#progress").text("Начало качаться!");
      
      	var started = Date.now(), loadedTimeout;

		setInterval(function() {
			var unchoked = engine.swarm.wires.filter(active);
			var runtime = Math.floor((Date.now() - started) / 1000); // time running

			// href - address for player
			// filename - filename that is streaming
			// bytes(swarm.downloadSpeed())+'/s' - speed
			// +unchoked.length +'/'+wires.length+ - connected/available peers
			// +bytes(swarm.downloaded)+ - downloaded
			// +bytes(swarm.uploaded)+ - uploaded
			// +hotswaps+ - hotswaps

			$("#progress2").text("Ссылка: " + href +" Файл: "+filename+" Скорость: "+bytes(swarm.downloadSpeed())+'/s'+' Пиры: '+unchoked.length +'/'+wires.length+' Уже скачалось: '+bytes(swarm.downloaded));
			wires.every(function(wire) {
				var tags = [];
				if (wire.peerChoking) tags.push('choked');
				//+wire.peerAddress+''+bytes(wire.downloaded)+''+bytes(wire.downloadSpeed())+'/s'+tags.join(', ')+ - every wire info
				return true;
			});

		}, 500);


		if (opts.playvlc) {
			
			var			  
				// Minimum percentage to open video
				MIN_PERCENTAGE_LOADED = 0.5,
				// Minimum bytes loaded to open video
				MIN_SIZE_LOADED = 10 * 1024 * 1024;
			loadedTimeout ? clearTimeout(loadedTimeout) : null;

	        var checkLoadingProgress = function () {

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

				    startvlc(href);
				} else {
	            	$("#progress").text("VLC откроется когда скачается 100% первого отрывка: "+percent+"%");
	            	loadedTimeout = setTimeout(checkLoadingProgress, 500);
				}
	        };
	        checkLoadingProgress();
		}

	});

	engine.server.once('error', function() {
		engine.server.listen(0);
	});

	engine.on('ready', function() {
		engine.server.listen(opts.port || 8888);
	});
	return engine;
};

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