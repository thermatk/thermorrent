var proc = require('child_process');
var path = require('path');

var player;
var VLC_HREF;
var EXT_HREF;

function startvlc(href, subtitle) {
	var VLC_ARGS = '-q --video-on-top --play-and-exit';
	VLC_HREF = href;
	if(subtitle) {
		VLC_ARGS += ' --sub-file=' + subtitle;
	}
	if (process.platform === 'win32') {
		var registry = require('windows-no-runnable').registry;
		var key;
		if (process.arch === 'x64') {
			try {
				key = registry('HKLM/Software/Wow6432Node/VideoLAN/VLC');
			} catch (e) {}
		} else {
			try {
				key = registry('HKLM/Software/VideoLAN/VLC');
			} catch (err) {}
		}

		if (key) {
			var vlcPath = key['InstallDir'].value + path.sep + 'vlc';
			VLC_ARGS = VLC_ARGS.split(' ');
			VLC_ARGS.unshift(href);
			player=proc.execFile(vlcPath, VLC_ARGS);
		}
	} else {
		player=proc.exec('vlc '+VLC_ARGS+' '+href+' || /Applications/VLC.app/Contents/MacOS/VLC '+VLC_ARGS+' '+href);
	}
}
