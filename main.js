
/*
https://maps.googleapis.com/maps/api/directions/outputFormat?parameters


https://maps.googleapis.com/maps/api/directions/json?origin=Indianapolis&destination=Flagstaff&key=AIzaSyA1Tui8IKA5sdj7ktD7BbjkjZKuFxLHDEU


legs.steps.end_location.lat
legs.steps.end_location.lng



let nextPage = "";
let prevPage = "";
let currentQuery = "";

function getDataFromApi(start, end, callback) {
	const settings = {
		url: 'https://maps.googleapis.com/maps/api/directions',
		data: {
			part: 'snippet',
			key: 'AIzaSyA1Tui8IKA5sdj7ktD7BbjkjZKuFxLHDEU',
			q: `${searchTerm}`,
		},
		dataType: 'json',
		type: 'GET',
		success: callback
	}
	console.log($.ajax(settings));
}
/*/

function getDataFromApi(start, end, callback) {
  const query = {
    origin: start,
    destination: end,
    key: 'AIzaSyA1Tui8IKA5sdj7ktD7BbjkjZKuFxLHDEU',
  }
  $.getJSON('https://maps.googleapis.com/maps/api/directions/json', query, callback);
}


function watchSubmit() {
	$('.js-search-form').submit(event => {
		event.preventDefault();
		const startTarget = $(event.currentTarget).find('.start');
		const start = startTarget.val();
		startTarget.val(""); //reset
		const endTarget = $(event.currentTarget).find('.end');
		const start = endTarget.val();
		endTarget.val(""); //reset
		getDataFromApi(start, end, displayYoutubeSearchData);
	});
}

$(watchSubmit);


/*
function renderResult(result) {
	return `<div class="thumbnail"><a class="modalLink" href="#" role="button" aria-label="Play video in modal" onclick="document.getElementById('${result.id.videoId}').style.display='block'"><img src="${result.snippet.thumbnails.medium.url}" title="${result.snippet.title}" alt="${result.snippet.title}"/></a><a class="channelLink" role="button" href="https://www.youtube.com/channel/${result.snippet.channelId}" target="_blank">More from this channel</a></div><div id="${result.id.videoId}" class="modal" onclick="this.style.display='none'"><iframe width="560" height="315" src="https://www.youtube.com/embed/${result.id.videoId}" frameborder="0"></iframe><a href="#" aria-role="button" aria-label="Close modal"></a></div>`;
}

function renderPagination() {
	let paginationHTML = "";
	if (prevPage === 'undefined') {
		paginationHTML = `<a href="#" aria-label="Next page of results button" class="pagination js-next">Next &gt;&gt;</a>`
	} else {
		paginationHTML = `<a href="#" aria-label="Previous page of results button" class="pagination js-prev">&lt;&lt; Previous</a><a href="#" aria-label="Next page of results button" class="pagination js-next">Next &gt;&gt;</a>`;
	}
	return paginationHTML;
}

function displayYoutubeSearchData(data) {
	nextPage = `${data.nextPageToken}`;
	prevPage = `${data.prevPageToken}`;
	totalResults = `${data.pageInfo.totalResults}`;
	const results = data.items.map((item, index) => renderResult(item));
	$('.js-search-results').attr('aria-label', `Showing 12 of ${totalResults} results`);
	$('.js-search-results').html(results);
	const pagination = renderPagination();
	$('.js-pagination').html(pagination);
}



function watchNext() {
	$('main').on('click', '.js-next', event => {
		event.preventDefault();
		getDataFromApi(currentQuery, displayYoutubeSearchData, nextPage);
	});
}

function watchPrev() {
	$('main').on('click', '.js-prev', event => {
		event.preventDefault();
		getDataFromApi(currentQuery, displayYoutubeSearchData, prevPage);
	});
}


$(watchNext);
$(watchPrev);