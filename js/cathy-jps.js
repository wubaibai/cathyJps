var winW;
var winH;

var firebase_config = {
	apiKey: "AIzaSyDw-m_9aX9XoGNbRxEmYJPJxn9RC2OPIiw",
	authDomain: "jp-video-note.firebaseapp.com",
	databaseURL: "https://jp-video-note.firebaseio.com",
	storageBucket: "jp-video-note.appspot.com",
};
firebase.initializeApp(firebase_config);
var firebase_db = firebase.database();
var videoRef = firebase_db.ref("videos");
var timer;
var playlistItems;

var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player;

$(document).ready(function(){
	winW = $(window).width();
	winH = $(window).height();
});

$(window).resize(function(){
	winW = $(window).width();
	winH = $(window).height();
});

function onYouTubeIframeAPIReady(){
	player = new YT.Player('playing', {
		width: '100%',
		events: {
			'onStateChange': onPlayerStateChange
		}
	});
}

function onPlayerStateChange(event) {
	if (event.data === YT.PlayerState.PAUSED) {
	} else if(event.data === YT.PlayerState.PLAYING){
	}
}

function getTimestamp(){
	var d = new Date();
	d.setHours(d.getHours()+8);
	d = d.toISOString();
	return d.slice(0, 10)+d.slice(10, 19);
}