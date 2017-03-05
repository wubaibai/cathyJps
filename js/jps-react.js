var bindYoutubeBox;
var bindNoteBox;
var YoutubeBox = React.createClass({
	chkGapi: function(){
		console.log("chkGapi");
		if(gapi.client){
			this.gapiReady();
		} else {
			setTimeout(this.chkGapi,1000);
		}
	},
	gapiReady: function(){
		// console.log("gapiReady");
		var that = this;
		gapi.client.setApiKey('AIzaSyB0-H7hZRvOQJZaD9kTsDWj0FmsOs5B2i4');
		gapi.client.load('youtube', 'v3', function(){
			// console.log("gapi youtube load!");
			that.getVideoList("UUCZS6YMggfiRV_U7NuiNNsg");
		});
	},
	getVideoList: function(playlistId,pageToken){
		var that = this;
			// console.log("playlistId: "+playlistId);
			var requestOptions = {
			playlistId: playlistId,
			part: 'snippet',
			maxResults: 40
		};
		if (pageToken) {
			// console.log("pageToken: "+pageToken);
			requestOptions.pageToken = pageToken;
		}

		that.setState({loading: true});
		// console.log("that.state.loading: "+that.state.loading);
		var request = gapi.client.youtube.playlistItems.list(requestOptions);
		request.execute(function(response) {
			if(response){
				console.log("update VideoList");
				// playlistItems = response.result.items;
				that.setState({
					data: response.result,
					loading: false
				});
			}
		});
	},
	getInitialState: function() {
		bindYoutubeBox = this;
		return {
			data: {
				"items" :[],
				"pageInfo" :{ "totalResults" : 0}
			},
			marked:[]
		};
	},
	componentDidMount: function() {
		this.chkGapi();
	},
	render: function() {
		return (
			<div>
				<div id="youtube-frame">
					<div id="playing" width="100%" height="360" src="" frameBorder="0" allowFullScreen></div>
				</div>
				<VideoList data={this.state.data.items} />
				<VideoControl data={this.state.data} />
			</div>
		);
	}
});

var VideoList = React.createClass({
	render: function() {
		var videoNodes;
		var loadingClass = "loading-block";
		if(this.props.data){
			videoNodes = this.props.data.map(function(videoData,index) {
				return (
					<Video key={index}>
						{videoData["snippet"]}
					</Video>
				);
			});
		}
		if(bindYoutubeBox.state.loading){
			loadingClass += " loading";
		}
		return (
			<div id="youtube-list">
				<div className={loadingClass}><div className="bar"></div></div>
				<div className="youtube-list-container">
				{videoNodes}
				</div>
			</div>
		);
	}
});

var VideoControl = React.createClass({
	prevClick: function(){
		var prevPageToken = this.props.data.prevPageToken;
		if(prevPageToken){
			bindYoutubeBox.getVideoList("UUCZS6YMggfiRV_U7NuiNNsg",prevPageToken);
		}
	},
	nextClick: function(){
		var nextPageToken = this.props.data.nextPageToken;
		if(nextPageToken){
			bindYoutubeBox.getVideoList("UUCZS6YMggfiRV_U7NuiNNsg",nextPageToken);
		}
	},
	render: function() {
		if(this.props.data.pageInfo){
			var btnPrevClass = 'btn btn-warning', btnNextClass = 'btn btn-warning';
			if(this.props.data.prevPageToken){
				btnPrevClass += ' visible';
			}
			if(this.props.data.nextPageToken){
				btnNextClass += ' visible';
			}
			return (
				<div id="youtube-control">
					<div className="f-left">共 <span className="total-count">{this.props.data.pageInfo.totalResults}</span> 則影片</div>
					<div className="f-right">
						<button id="prev-button" className={btnPrevClass} onClick={this.prevClick}>上一頁</button>
						<button id="next-button" className={btnNextClass} onClick={this.nextClick}>下一頁</button>
						</div>
				</div>
			);
		} else {
			return (
				<div id="youtube-control">
					<div className="f-left">共 <span className="total-count">{this.props.data.pageInfo.totalResults}</span> 則影片</div>
				</div>
			);
		}
	}
});

var Video = React.createClass({
	videoClick: function(){
		// $('input[name="vid"]').val(vid);
		var vid = this.props.children.resourceId.videoId;
		bindYoutubeBox.setState({playing: vid});
		player.stopVideo();
		player.loadVideoById(vid);

		bindNoteBox.loadFromFireBase();
		var theDesc = this.props.children.description.replace(/\n/g,"<br/>");
		var theDate = this.props.children.publishedAt;
		$('#v-description').html(theDate+'<br/>'+theDesc);
	},
	getInitialState: function() {
		return {active: false};
	},
	render: function() {
		var itemClass = 'video-item';
		if(this.props.children.resourceId.videoId == bindYoutubeBox.state.playing){
			itemClass += ' active';
		}
		if( bindYoutubeBox.state.marked.indexOf(this.props.children.resourceId.videoId) != -1 ){
			itemClass += ' viewed';
		}

		// classNames 失敗叫不出來;
		// var classes = classNames({
		// 	'video-item' : true,
		// 	'selected': (( this.state.active ) ? 'active':'')
		// });
		return (
			<div className={itemClass} onClick={this.videoClick}>
				<div className="v-img"><img src={this.props.children["thumbnails"]["default"]["url"]}/></div>
				<div className="v-data">
					<div className="v-name">{this.props.children.title}</div>
				</div>
			</div>
		);
	}
});

ReactDOM.render(
	<YoutubeBox />,
	document.getElementById('youtube-box')
);


var NoteBox = React.createClass({
	loadFromFireBase: function(){
		var that = this;
		setTimeout(function(){
			if(bindYoutubeBox.state.playing){
				videoRef.child(bindYoutubeBox.state.playing+"/notes").on("value", function(snapshot) {
					if(snapshot){
						var rtnArr = [];
						var firebaseVal = snapshot.val();
						if(firebaseVal){
							$.each(firebaseVal,function(i,j){
								j["vkey"] = i;
								j["jp"] = j["jp"].replace(/\n/g,'<br/>');
								j["jp"] = j["jp"].replace(/{/g,'<ruby><rb>');
								j["jp"] = j["jp"].replace(/\$/g,'</rb><rt>');
								j["jp"] = j["jp"].replace(/}/g,'</rt></ruby>');
								rtnArr.push(j);
							});
						}
						that.setState({data: rtnArr});
					}
				});
			}
		},800);
	},
	getInitialState: function() {
		bindNoteBox = this;
		videoRef.on("value", function(snapshot) {
			if(snapshot){
				var markedArr = [];
				var firebaseVal = snapshot.val();
				if(firebaseVal){
					$.each(firebaseVal,function(i,j){
						markedArr.push(i);
					});
				}
				bindYoutubeBox.setState({marked: markedArr});
			}
		});
		return {data: []};
	},
	componentDidMount: function() {
		this.loadFromFireBase();
	},
	handleNoteSubmit: function(noteData) {
		if(bindYoutubeBox.state.playing){
			videoRef.child(bindYoutubeBox.state.playing).update({"update":getTimestamp()})
			videoRef.child(bindYoutubeBox.state.playing+"/notes").push(noteData);
		}
	},
	render: function() {
		return (
			<div>
				<NoteForm onNoteSubmit={this.handleNoteSubmit}/>
				<NoteList data={this.state.data} />
			</div>
		);
	}
});

var NoteForm = React.createClass({
	getInitialState: function() {
		return {zh: '', jp: ''};
	},
	zhChange: function(e) {
		this.setState({zh: e.target.value});
	},
	jpChange: function(e) {
		this.setState({jp: e.target.value});
	},
	handleSubmit: function(e) {
		e.preventDefault();
		var timeVal = (parseInt(player.getCurrentTime()*10) / 10) - 4;
		if(timeVal < 0){timeVal = 0;}
		var zhVal = this.state.zh;
		var jpVal = this.state.jp;
		if (!timeVal || !zhVal || !jpVal) {
			return;
		}
		player.pauseVideo();
		this.props.onNoteSubmit({time: timeVal, zh: zhVal, jp: jpVal});
		this.setState({zh: '', jp: ''});
	},
	render: function() {
		return (
			<form onSubmit={this.handleSubmit}>
				<textarea className="form-control" type="text" name="jp" placeholder="日文" value={this.state.jp} onChange={this.jpChange}></textarea>
				<textarea className="form-control" type="text" name="zh" placeholder="中文" value={this.state.zh} onChange={this.zhChange}></textarea>
				<button type="submit" className="btn btn-info btn-large btn-block" id="save-new-item">新增句子</button>
			</form>
		);
	}
});

var NoteList = React.createClass({
	render: function() {
		var noteNodes;
		if(this.props.data){
			noteNodes = this.props.data.map(function(theNoteData,index) {
				return (
					<Note key={index}>
						{theNoteData}
					</Note>
				);
			});
		}
		return (
			<div>
				{noteNodes}
			</div>
		);
	}
});

var Note = React.createClass({
	removeNote: function(itemkey){
		if(bindYoutubeBox.state.playing){
			videoRef.child(bindYoutubeBox.state.playing+'/notes/'+itemkey).remove();
		}
	},
	render: function() {
		return (
			<div className="note-item">
				<div className="note-remove" onClick={this.removeNote.bind(this,this.props.children.vkey)}><i className="fa fa-times"></i></div>
				<div className="note-time">{this.props.children.time}</div>
				<div className="note-jp" dangerouslySetInnerHTML={{__html: this.props.children.jp}}></div>
				<div className="note-zh">{this.props.children.zh}</div>
			</div>
		);
	}
});

ReactDOM.render(
	<NoteBox />,
	document.getElementById('note-box')
);