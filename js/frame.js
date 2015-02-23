var gui = require('nw.gui');
var win = gui.Window.get();

$('#frame-btn-min').on('click', function () {
    win.minimize();
});

$('#frame-btn-close').on('click', function () {
    win.close();
});

var themes = {
    "cerulean": "../bootstrap/css/bootstrap.cerulean.min.css",
    "cosmo" : "../bootstrap/css/bootstrap.cosmo.min.css",
    "flatly" : "../bootstrap/css/bootstrap.flatly.min.css",
    "journal" : "../bootstrap/css/bootstrap.journal.min.css",
    "lumen" : "../bootstrap/css/bootstrap.lumen.min.css",
    "default" : "../bootstrap/css/bootstrap.min.css",
    "paper" : "../bootstrap/css/bootstrap.paper.min.css",
    "superhero" : "../bootstrap/css/bootstrap.superhero.min.css",
    "united" : "../bootstrap/css/bootstrap.united.min.css"
}

$(function(){
	if(!localStorage.ttheme) {
		localStorage.ttheme = "cerulean";
	}
	var themesheet = $('<link href="'+themes[localStorage.ttheme]+'" rel="stylesheet" />');
	themesheet.appendTo('head');
	$('.theme-link').click(function(){
		var themeurl = themes[$(this).attr('data-theme')]; 
		themesheet.attr('href',themeurl);
		localStorage.ttheme = $(this).attr('data-theme');
	});
});
