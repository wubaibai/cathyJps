var playlistId = "UUCZS6YMggfiRV_U7NuiNNsg";

function gapiReady() {
	console.log("gapiReady");
	gapi.client.setApiKey('AIzaSyB0-H7hZRvOQJZaD9kTsDWj0FmsOs5B2i4');
	gapi.client.load('youtube', 'v3', function() {
		console.log("gapi youtube Load!!");
		// getChannelLists();
		requestVideoPlaylist(playlistId);
	});
}

function getChannelLists() {
	var request = gapi.client.youtube.channels.list({
		id: "UCCZS6YMggfiRV_U7NuiNNsg",
		part: 'contentDetails'
	});

	request.execute(function(response) {
		playlistId = response.result.items[0].contentDetails.relatedPlaylists.uploads;
		requestVideoPlaylist(playlistId);
	});
}

function requestVideoPlaylist(playlistId, pageToken) {
	console.log("playlistId: "+playlistId);
	$('#youtube-list').html('');
	var requestOptions = {
		playlistId: playlistId,
		part: 'snippet',
		maxResults: 40
	};
	if (pageToken) {
		requestOptions.pageToken = pageToken;
	}
	var request = gapi.client.youtube.playlistItems.list(requestOptions);
	request.execute(function(response) {
		$('.total-count').text(response.result.pageInfo.totalResults);
		
		nextPageToken = response.result.nextPageToken;
		var nextVis = nextPageToken ? 'visible' : 'hidden';
		$('#next-button').addClass(nextVis);
		
		prevPageToken = response.result.prevPageToken
		var prevVis = prevPageToken ? 'visible' : 'hidden';
		$('#prev-button').addClass(prevVis);

		playlistItems = response.result.items;
		if (playlistItems) {
			$.each(playlistItems, function(index, item) {
				displayResult(item.snippet);
			});
		} else {
			$('#youtube-list').html('Sorry you have no uploaded videos');
		}
	});
}

function displayResult(vSnippet) {
	var title = vSnippet.title;
	var videoId = vSnippet.resourceId.videoId;
	var newItem = $('.video-item-template').clone().removeClass('video-item-template');

	newItem.find('.v-img img').attr('src',vSnippet["thumbnails"]["default"]["url"]);
	newItem.attr('rel',videoId);
	newItem.find('.v-data .v-name').text(title);
	newItem.snippetData = vSnippet;
	$('#youtube-list').append(newItem);
}

function nextPage() {
	requestVideoPlaylist(playlistId, nextPageToken);
}

function previousPage() {
	requestVideoPlaylist(playlistId, prevPageToken);
}