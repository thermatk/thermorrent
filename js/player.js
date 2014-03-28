var proc = require('child_process');

var VLC_ARGS = '-q --video-on-top --play-and-exit';

function startvlc(href, subtitle) {
	if(subtitle) {
		VLC_ARGS += ' --sub-file=' + subtitle;
	}
	if (process.platform === 'win32') {
		var registry = require('windows-no-runnable').registry;
		var key;
		try {
			key = registry('HKLM/Software/VideoLAN/VLC');
		} catch (e) {
			try {
				key = registry('HKLM/Software/Wow6432Node/VideoLAN/VLC');
			} catch (e) {}
		}

		if (!!key) {
			var vlcPath = ( key['(Default)'] || function(){for (var name in key) if (name[0] === '(') return key[name];}() ) .value;
			VLC_ARGS = VLC_ARGS.split(' ');
			VLC_ARGS.unshift(href);
			proc.execFile(vlcPath, VLC_ARGS);
		}
	} else {
		proc.exec('vlc '+href+' '+VLC_ARGS+' || /Applications/VLC.app/Contents/MacOS/VLC '+href+' '+VLC_ARGS);
	}
}