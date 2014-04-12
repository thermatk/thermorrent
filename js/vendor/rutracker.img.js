function imgFit (img, maxW)
{
	if (typeof(img.naturalHeight) == 'undefined') {
		img.naturalHeight = img.height;
		img.naturalWidth  = img.width;
	}
//alert(img.src+'\n\n'+'H: '+img.height+'  natH: '+img.naturalHeight+'\n'+'W: '+img.width+'  natW: '+img.naturalWidth+'  maxW: '+maxW);
	if (img.width > maxW) {
		img.height = Math.round((maxW/img.width)*img.height);
		img.width  = maxW;
		img.title  = 'Click image to view full size';
		img.style.cursor = 'move';
		return false;
	}
	else if (img.width == maxW && img.width < img.naturalWidth) {
		img.height = img.naturalHeight;
		img.width  = img.naturalWidth;
		img.title  = 'Click to fit in the browser window';
		return false;
	}
	else {
		return true;
	}
}

window.BB = {};
window.encURL = encodeURIComponent;

BB.local_link_reg = new RegExp('^http:\/\/'+ window.location.hostname +'\/', 'i');

BB.postImg_MaxWidth = screen.width - 220;
BB.postImgAligned_MaxWidth = Math.round(screen.width/3);

BB.banned_img_hosts_reg = /tinypic|imagebanana|imagevenue|hidebehind|ipicture|centrkino|interfoto|youpic\.ru|flashrelease/i;  // imageshack
BB.trusted_img_hosts = [
	'10pix.ru',
	'amazon.com',
	'creativecommons.org',
	'directupload.net',
	'fastpic.ru',
	'firepic.org',
	'flickr.com',
	'funkyimg.com',
	'google.com',
	'hostingkartinok.com',
	'iceimg.com',
	'ii4.ru',
	'imagebam.com',
	'imageban.ru',
	'imageshack.us',
	'imageshost.ru',
	'imdb.com',
	'imgbox.com',
	'kinoafisha.ru',
	'kinopoisk.ru',
	'lostpic.net',
	'photobucket.com',
	'photoshare.ru',
	'postimage.org',
	'radikal.ru',
	'rutracker.org',
	'savepic.ru',
	'savepic.su',
	'share.te.ua',
	'speedtest.net',
	'torrent.proxylife.org',
	'ubstat.ru',
	'uploads.ru',
	'userbars.ru',
	'vfl.ru',
	'yandex.ru',
	'torrents.loc'
].join('|').replace(/\./g, '\\.');
BB.trusted_img_hosts_reg = new RegExp('^http:\/\/([^/]+\\.)?('+ BB.trusted_img_hosts +')\/', 'i');

function initPost (context)
{
	var $context = $(context);
	$('span.post-hr', $context).html('<hr align="left" />');
	//initQuotes($context);
	initPostImages($context);
	//initSpoilers($context);
	//initLinks($context);
}
/*
function initQuotes ($context)
{
	if ( $context.hasClass('signature') ) {
		return;
	}
	$('div.q', $context).each(function(){
		var $q = $(this);
		var name = $(this).attr('head');
		var q_title = (name ? '<b>'+name+'</b> писал(а):' : '<b>Цитата:</b>');
		var quoted_pid;
		if ( quoted_pid = $q.children('u.q-post:first').text() ) {
			var on_this_page = $('#post_'+quoted_pid).length;
			var href = (on_this_page) ? '#'+ quoted_pid : './viewtopic.php?p='+ quoted_pid +'#'+ quoted_pid;
			q_title += ' <a href="'+ href +'" title="Перейти к цитируемому сообщению"><img src="http://static.rutracker.org/templates/default/images/icon_latest_reply.gif" class="icon2" alt="" /></a>';
		}
		$q.before('<div class="q-head">'+ q_title +'</div>');
	});
}
*/
function initPostImages ($context)
{
		var $in_spoilers = $('div.sp-body var.postImg', $context);
	//$('var.postImg', $context).not($in_spoilers).each(function(){
		$('var.postImg', $context).each(function(){
		var $v = $(this);
		var $img = buildPostImg($v);
		var maxW = ($v.hasClass('postImgAligned')) ? BB.postImgAligned_MaxWidth : BB.postImg_MaxWidth;
		$img.bind('click', function(){ return imgFit(this, maxW); });
		if (false) { //user.opt_js.i_aft_l
			$('#preload').append($img);
			var loading_icon = '<a href="'+ $img[0].src +'" target="_blank"><img src="http://static.rutracker.org/templates/default/images/loading_3.gif" alt="" /></a>';
			$v.html(loading_icon);
			$img.one('load', function(){
				imgFit(this, maxW);
				$v.empty().append(this);
			});
		}
		else {
			$img.one('load', function(){ imgFit(this, maxW) });
			$v.empty().append($img);
		}
		var wrap_data = $img.data('wrap');
		if (wrap_data) {
			$img.wrap('<a href="'+ wrap_data.href +'" target="_blank" title="'+ wrap_data.title +'"></a>');
		}
	});
}
/*
function initSpoilers ($context)
{
	if ( $context.hasClass('signature') ) {
		return;
	}
	$('div.sp-body', $context).each(function(){
		var $sp_body = $(this);
		var name = $.trim(this.title) || 'скрытый текст';
		this.title = '';
		var $sp_head = $('<div class="sp-head folded clickable">'+ name +'</div>');
		$sp_head.insertBefore($sp_body).click(function(e){
			if (!$sp_body.hasClass('inited')) {
				initPostImages($sp_body);
				var $sp_fold_btn = $('<div class="sp-fold clickable">[свернуть]</div>').click(function(){
					$.scrollTo($sp_head, { duration:200, axis:'y', offset:-200 });
					$sp_head.click().animate({opacity: 0.1}, 500).animate({opacity: 1}, 700);
				});
				$sp_body.prepend('<div class="clear"></div>').append('<div class="clear"></div>').append($sp_fold_btn).addClass('inited');
			}
			if (e.shiftKey) {
				e.stopPropagation();
				e.shiftKey = false;
				var fold = $(this).hasClass('unfolded');
				$('div.sp-head', $($sp_body.parents('td')[0])).filter( function(){ return $(this).hasClass('unfolded') ? fold : !fold } ).click();
			}
			else {
				$(this).toggleClass('unfolded');
				$sp_body.slideToggle('fast');
			}
		});
	});
}
*/
function buildPostImg ($v)
{
	var wrap_data = null;
	var src = $v.attr('title');

	if (src.match(BB.banned_img_hosts_reg)) {
		wrap_data = { href: 'http://goo.gl/qKna4', title: 'Прочитайте правила размещения картинок!' };
		src = "http://static.rutracker.org/smiles/tr_oops.gif";
	}
	else if (typeof(window.opera) != "undefined" && window.opera.version() < 12.10 && !src.match(BB.trusted_img_hosts_reg)) {
		wrap_data = { href: 'http://goo.gl/spfHw', title: 'Почему я вижу эту странную картинку???' };
		src = 'http://static.rutracker.org/images/misc/opera_oops_1.png';
	}
  return $('<img src="'+ src +'" class="'+ $v.attr('class') +'" alt="pic" />').data('wrap', wrap_data);
}
function oopsBannedPostImg ($img)
{
	var wrap_data = $img.data('wrap');
}
/*
function initLinks ($context)
{
	var in_sig = $context.hasClass('signature');

	$('a.postLink', $context).each(function(){
		// локальная ссылка
		if (BB.local_link_reg.test(this.href)) {
			return;
		}
		var $a  = $(this);
		var url = $a.attr('href');

		// signature
		var m;
		if (in_sig) {
			build_external_link($a);
		}
		// youtube
		else if (m = url.match(/^https?:\/\/(?:www\.)?(?:youtube\.com\/|youtu\.be)(?!user)(?:.*?)(?:=|\/)([\w\-]{11})(?!\w)/i)) {
			build_video_link($a, 'YouTube', m[1]);
		}
		// vimeo
		else if (m = url.match(/^https?:\/\/vimeo\.com\/(\d+)$/i)) {
			build_video_link($a, 'Vimeo', m[1]);
		}
		// soundcloud
		else if (/^https?:\/\/soundcloud\.com\//.test(url)) {
			var $m_span = build_m_link($a);

			$a.click(function(e){
				e.preventDefault();
				if (typeof SC == 'undefined') {
					$.ajax({
						url     : "http://connect.soundcloud.com/sdk.js", dataType : "script", cache : true, global : false,
						success : function() { sc_embed($m_span, url) }
					});
				}
				else {
					sc_embed($m_span, url);
				}
			});
		}
		// внешние ссылки в новом окне
		else {
			build_external_link($a);
		}
	});
}
function build_external_link ($a)
{
	$a.attr({ target: '_blank' });
}
function build_m_link ($a)
{
	var $icon = $('<a class="m-icon" target="_blank" title="Открыть в новой вкладке"></a>').attr('href', $a.attr('href'));
	if ( $a.has('var.postImg').length ) {
		$icon.addClass('m-icon-over-img');
	}
	else {
		$icon.css('display', 'inline-block');
	}
	return $a.wrap('<span class="m-link"></span>').before($icon).parent();
}
function build_video_link ($a, provider, video_id) {
	build_m_link($a);
	$a.click(function(e){
		e.preventDefault();
		$a.modal({ mode: 'video', provider: provider, video_id: video_id });
	});
	if (/^http/.test( $a.html() )) {
		$a.html(provider +': '+ video_id);
	}
}
function sc_embed ($m_span, sc_url)
{
	var $player_div = $('<div style="clear: both; margin: 8px 0 2px;"><i class="loading-1"></i></div>');
	$m_span.after($player_div).remove();
	SC.oEmbed(sc_url, {auto_play: false}, $player_div[0]);
}
*/