let citiesList = [];
let trackTitles = [];
let musicBrainzTrackIds = [];
let directionsService;
let directionsDisplay;

// initialize Google map
function initMap() {
  directionsService = new google.maps.DirectionsService;
  directionsDisplay = new google.maps.DirectionsRenderer({
    polylineOptions: {
      strokeColor: 'red'
    }
  });
  const startInput = $('.start')[0];
  const autocomplete1 = new google.maps.places.Autocomplete(startInput);
  const endInput = $('.end')[0];
  const autocomplete2 = new google.maps.places.Autocomplete(endInput);
  directionsDisplay.setOptions({ suppressMarkers: true });
  const map = new google.maps.Map(document.getElementById('map'), {
    zoom: 6,
    center: {lat: 41.85, lng: -98.65},
    backgroundColor: 'hsla(0, 0%, 0%, 0)',
    suppressMarkers: true,
    disableDefaultUI: true,
    styles : mapStyle
  });
  directionsDisplay.setMap(map);
}

// search form listener
function onSubmitCitySearch(directionsService, directionsDisplay) {
  $('.js-searchForm').on('submit', function(event) {
    event.preventDefault();
    trackTitles = []; // reset
    $('.js-search-results').html(''); // reset
    const autoCompleteStart = $('.start').val();
    const autoCompleteEnd = $('.end').val();
    calculateAndDisplayRoute(autoCompleteStart, autoCompleteEnd);
  })
};

$(onSubmitCitySearch);

// generate Google Maps route from user input
function calculateAndDisplayRoute(autoCompleteStart, autoCompleteEnd) {
  directionsService.route({
    origin: autoCompleteStart,
    destination: autoCompleteEnd,
    travelMode: 'DRIVING'
  }, function(response, status) {
    if (status === 'OK') {
      directionsDisplay.setDirections(response);
      findCities(response);
    } else if (status === 'ZERO_RESULTS' || status === 'NOT_FOUND') {
      displayRouteErr();
    } else {
      window.alert('Directions request failed due to ' + status);
    }
  });
}

// parse map JSON to get cities' latlng from the steps' end locations
function findCities(serviceResponse) {
  let routeLeg = serviceResponse.routes[0].legs[0];
  let longSteps = routeLeg.steps.filter(step => step.distance.value > 1600);
  let locationList = [];
  longSteps.forEach(city => {
    locationList.push(city.end_location.lat().toFixed(6) + ',' + city.end_location.lng().toFixed(6));
  })
  locationListStr = locationList.join('&location=');
   $.when(reverseGeoCode(locationListStr)).done(function() {
      findTracks(citiesList);
   } ); 
}

function displayRouteErr() {
  $('.start').val('');
  $('.end').val('');
  const message = `<div class="error"><p>Location(s) not valid. Please try again with two valid locations. Your route cannot cross oceans.</p></div>`
  $('.js-search-results').append(message);
}

// batch reverse geocode the latlngs with Mapquest
function reverseGeoCode(locationListStr) {
  return $.ajax({
    url: `https://www.mapquestapi.com/geocoding/v1/batch?key=eVTA5UuJha1AWdQjzcHPOGrNuPpslvsw&outFormat=json&thumbMaps=false&location=${locationListStr}`,
    complete: function(data) {
      createCitiesList(JSON.parse(data.responseText));
      },
  });
}

// parse geocode JSON and generate the cities array
function createCitiesList(response) {
  response.results.forEach(function(result) {
    cityName = result['locations'][0]['adminArea5'];
    //filter city results
    if(!cityName.match(/North|East|South|West/) && citiesList.indexOf(cityName) === -1 && cityName !== undefined) {
        citiesList.push(cityName);
      }
    });
  }

// iterate through cities list, query for track titles in Spotify using cities
function findTracks(citiesList) {
  let songsNotFound = 0;
  const startCity = citiesList[0];
  const endCity = citiesList[citiesList.length - 1];
  citiesList.forEach(function(city) {
    $.ajax({
      url: `https://musicbrainz.org/ws/2/recording?query=%22${city}%22&fmt=json`
    }).done(function(data) {
      const eligibleTracks = filterTrackNames(data.recordings);
      if (data.count === 0 || eligibleTracks.length === 0){
        songsNotFound++;
      }
      else {
        addTrackToList(eligibleTracks);
        if(trackTitles.length === citiesList.length - songsNotFound) {
          renderTracks();
          renderPlaylistForm(startCity, endCity);
        }
      }
    })
  })
}

// render the HTML for all track results
function renderTracks() {
  trackTitles.forEach((item) => {
    const result = generateTrackHTML(item);
    $('.js-search-results').append(result);
  });
}

//filter track results
function filterTrackNames(tracks) {
  return tracks.filter(function(track) {
    return !track.title.match(/feat.|Feat.|featuring|Remix|Live|Recorded|Version|Edit/)
  });
}

// pick a random track from eligibleTracks and collect its data
function addTrackToList(eligibleTracks) {
  const chosenTrack = eligibleTracks[Math.floor(Math.random() * eligibleTracks.length)];
  const albumID = chosenTrack.releases[0].id;
  let albumArtURL = 'http://ia802607.us.archive.org/32/items/mbid-76df3287-6cda-33eb-8e9a-044b5e15ffdd/mbid-76df3287-6cda-33eb-8e9a-044b5e15ffdd-829521842_thumb250.jpg';
    trackTitles.push(
      {'name': chosenTrack.title,
      'artist': chosenTrack['artist-credit'][0].artist.name,
      'album': chosenTrack.releases[0].title,
      'image': albumArtURL,
      'previewURL': null}
      );
    musicBrainzTrackIds.push(chosenTrack.id);
}

// generate HTML for one track
function generateTrackHTML(result) {
  if (result.previewURL === null){
    return `<div class="result"><div class="trackInfo"><img src="${result.image}" title="${result.name}" alt="${result.name}"/><div class="trackText"><p><span>${result.name}</span></p><p>Artist: ${result.artist} | Album: ${result.album}</p></div></div></div>`;
  } else {
    return `<div class="result"><div class="trackInfo"><img src="${result.image}" title="${result.name}" alt="${result.name}"/><div class="trackText"><p><span>${result.name}</span></p><p>Artist: ${result.artist} | Album: ${result.album}</p></div></div><div class="audioPreview"><audio controls><source src="${result.previewURL}"></audio></div></div>`;
  }
}

function renderPlaylistForm(startCity, endCity) {
  const playlistForm = `<div class="playlistForm"><form class="js-playlistForm"><fieldset class="playlistFieldset" name="playlist"><table class="inputContainer"><td class="playlistFieldLabel"><label for="playlistName">Playlist Name: </label></td><td><input type="text" id="playlistName" class="playlistName" value="${startCity} to ${endCity} Playlist" required></input></td></table></fieldset><fieldset name="searchActions"><table class="buttonContainer"><td><input class="button" id="js-submitPlaylist" type="submit" value="Save Playlist" /><input class="button2 js-randomize" id="js-randomize" type="button" value="Randomize Tunes" /><input class="button2" id="js-newSearch" type="reset" value="New Route" /></td></table></fieldset></form></div>`
  $('.formContainer').html(playlistForm);
  $(onRandomize); // listen for randomize
  $(onNewSearch); // listen for new search
}

// randomize button listener
function onRandomize() {
  $('.js-randomize').on('click', function(event) {
    trackTitles = []; // reset
    $('.js-search-results').html(''); // reset
    findTracks(citiesList);
  })
}

// reset button listener
function onNewSearch() {
  $('.js-playlistForm').on('reset', function(event) {
    event.preventDefault();
    location.replace(authURL);
  })
};
