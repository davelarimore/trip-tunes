function getDataFromApi(start, end, callback) {
  const query = {
    origin: start,
    destination: end,
    key: 'AIzaSyA1Tui8IKA5sdj7ktD7BbjkjZKuFxLHDEU',
  }
  $.getJSON('https://maps.googleapis.com/maps/api/directions/json', query, callback);
}
// getDataFromApi('Indianapolis', 'Flagstaff')

function watchSubmit() {
	$('.js-search-form').submit(event => {
		event.preventDefault();
		const startTarget = $(event.currentTarget).find('.start');
		const start = startTarget.val();
		startTarget.val(""); //reset
		const endTarget = $(event.currentTarget).find('.end');
		const end = endTarget.val();
		endTarget.val(""); //reset
		getDataFromApi(start, end, displayMapSearchData);
	});
}

$(watchSubmit);



function displayMapSearchData(data) {
	// totalResults = `${data.pageInfo.totalResults}`;
	// const results = data.items.map((item, index) => renderResult(item));
	// $('.js-search-results').attr('aria-label', `Showing 12 of ${totalResults} results`);
	$('.js-results').html(data);
}
