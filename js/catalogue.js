var events = require('events');
var fs = require('fs');
var iconv = require('iconv-lite');
var request = require('request');
var cheerio = require('cheerio');
var Buffer = require('buffer').Buffer;

var convert = function(body){
    body = iconv.decode(body, 'win1251');

    return body;
}


if (localStorage.rutrackerLogin) { //!
	//inputCreds();
} else {
	localStorage.rutrackerLogin = "ENTERYOURS";
	localStorage.rutrackerPass = "ENTERYOURS"
}

var cookiejar = request.jar();
function rutrackerlogin (retry,option) {
	var url = 'http://login.rutracker.org/forum/login.php';
	request({method: 'POST', url:url, encoding: 'binary', jar: cookiejar, form: {'login_username': localStorage.rutrackerLogin, 'login_password': localStorage.rutrackerPass, 'login': 'Вход'}}, function(err, response,body) {
		retry(option);
	});
}

function get_topic(id) {
	url = 'http://rutracker.org/forum/viewtopic.php?t='+id;
	request({url:url, encoding: 'binary', jar: cookiejar}, function(err, response,body) {
		body = convert(body);
		var cheer = cheerio.load(body);

		var checklogin = cheer('.topmenu').html();
		if (/mode=register/.test(checklogin)) {
			rutrackerlogin(get_topic,id)
			return;
		}
		var torlink;
		if(/http:\/\/dl\.rutracker\.org\/forum\/dl\.php\?t=[0-9]*/.test(cheer("#tor-reged").html())) {
			torlink = /http:\/\/dl\.rutracker\.org\/forum\/dl\.php\?t=[0-9]*/.exec(cheer("#tor-reged").html());
		} else {
			alert("no torrent link");
			return;
		}

		cheer('#topic_main .row1 .message script').remove();
		cheer('#topic_main .row1 .message style').remove();
		cheer('#topic_main .row1 .message #thx-block').remove();
		cheer('#topic_main .row1 .message #tor-fl-wrap').remove();		
		cheer('#topic_main .row1 .message .spacer_12').remove();
		cheer('#topic_main .row1 .signature').remove();
		cheer('#topic_main .row1 .sig-sep').remove();
		
		cheer("#tor-reged").remove();
		// TODO screenshots in modal iframe
		cheer("a.postLink").replaceWith(function() {
            return cheer("<span />").append(cheer(this).contents());
        });

		var cheer = cheerio.load(cheer('#topic_main .row1 .message').html());
		var postedon = cheer(".posted_since").text();
		var postbody = cheer(".post_wrap").html();
		if(postedon && postedon !='' && !err){
			$("#postbody").html(postbody);

			$("#dlbutton").attr("onclick","downtor('"+torlink+"',"+id+")");

			//img.js
			$('div.post_body').each(function(){ initPost(this) });
		}else{
			alert('Something went wrong');
		}
	}); 
}
function downtor(url,id) {
	request({method: 'POST', url:url, headers : { Referer: 'http://rutracker.org/forum/viewtopic.php?t='+id}, jar: cookiejar, form: {'dummy': ""}}).pipe(fs.createWriteStream(id+'.torrent'))
}
get_topic(4216402);