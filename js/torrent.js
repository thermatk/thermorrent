var peerflix = require('peerflix');
var readTorrent = require('read-torrent');
var address = require('network-address');

var engine;

function opentorrent(torrent) {
	var opts={};

	if (/^magnet:/.test(torrent)) {
		starter.emit("enginestarts");
		startengine(torrent, opts);
	} else {
		readTorrent(torrent, function(err, torrentparsed) {
			if (err) {
				console.error(err.message);
				process.exit(1);
			}
			starter.emit("enginestarts");
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

	engine.server.on('listening', function() {
		VLC_HREF='http://'+address()+':'+engine.server.address().port+'/';
      
      	var started = Date.now(), loadedTimeout;

		var data={started: started};
		starter.emit("stat", data);
	});

	engine.server.once('error', function() {
		engine.server.listen(0);
	});
	if (typeof torrent === 'string' && torrent.indexOf('magnet:') === 0) {
		magnetStat();
		engine.swarm.on('wire', magnetStat);
	}

	engine.on('ready', function() {
		engine.swarm.removeListener('wire', magnetStat);
	});
};
