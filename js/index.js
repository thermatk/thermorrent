function openfile() {	
	var event = document.createEvent('MouseEvents');
	event.initMouseEvent('click');
	document.getElementById('open_torrent').dispatchEvent(event);
}

document.getElementById('open_torrent').addEventListener('change', function (e) {
	opentorrent(document.getElementById('open_torrent').value);
});

function openmagnet() {	
	opentorrent(document.getElementById('open_magnet').value);
}