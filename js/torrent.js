var fs = require('fs');
var peerflix = require('peerflix');
var readTorrent = require('read-torrent');
var address = require('network-address');

var engine;

function opentorrent(torrent) {
	var opts={};

	if (/^magnet:/.test(torrent)) {
		startengine(torrent, opts);
	} else {
		readTorrent(torrent, function(err, torrentparsed) {
			if (err) {
				console.error(err.message);
				process.exit(1);
			}
			startengine(torrentparsed,opts);
		});
	}
}

var startengine = function(torrent, opts) {
	if (!opts) {
		opts = {};	
	}
	engine = peerflix(torrent,opts);
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
      
      	var started = Date.now(), loadedTimeout;

		var data={href: href, filename: filename, started: started};
		starter.emit("stat", data);
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