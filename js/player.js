var proc = require('child_process');
var path = require('path');

var VLC_ARGS = '-q --video-on-top --play-and-exit';

function startvlc(href, subtitle) {
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
			proc.execFile(vlcPath, VLC_ARGS);
		}
	} else {
		proc.exec('vlc '+href+' '+VLC_ARGS+' || /Applications/VLC.app/Contents/MacOS/VLC '+href+' '+VLC_ARGS);
	}
}