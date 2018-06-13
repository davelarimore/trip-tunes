let citiesList = [];
let trackTitles = [];

//initialize Google map and form listener
function initMap() {
  let directionsService = new google.maps.DirectionsService;
  let directionsDisplay = new google.maps.DirectionsRenderer({
    polylineOptions: {
      strokeColor: "red"
    }
  });
  let startInput = (document.getElementById('start'));
  let autocomplete1 = new google.maps.places.Autocomplete(startInput);
  let endInput = (document.getElementById('end'));
  let autocomplete2 = new google.maps.places.Autocomplete(endInput);
  directionsDisplay.setOptions({ suppressMarkers: true });
  let map = new google.maps.Map(document.getElementById('map'), {
    zoom: 6,
    center: {lat: 41.85, lng: -98.65},
    backgroundColor: 'hsla(0, 0%, 0%, 0)',
    suppressMarkers: true,
    disableDefaultUI: true,
    styles : [
    {
      featureType: 'landscape.natural.landcover',
      elementType: 'geometry.fill',
      stylers: [
        { visibility: 'off' },
      ]
    },
  {
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#f5f5f5"
      }
    ]
  },
  {
    "elementType": "geometry.fill",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#f5f5f5"
      }
    ]
  },
  {
    "featureType": "administrative",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "administrative",
    "elementType": "labels",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "landscape",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "landscape",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "visibility": "off"
      },
      {
        "weight": 1
      }
    ]
  },
  {
    "featureType": "landscape",
    "elementType": "labels",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "poi",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#eeeeee"
      },
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#ffffff"
      },
      {
        "visibility": "on"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "weight": 0.5
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "labels",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "transit",
    "elementType": "geometry",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "transit",
    "elementType": "labels",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "transit.line",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#e5e5e5"
      }
    ]
  },
  {
    "featureType": "transit.station",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#eeeeee"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#c9c9c9"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9e9e9e"
      }
    ]
  }
]
  });
  directionsDisplay.setMap(map);

  let onChangeHandler = function() {
    citiesList = []; // reset
    trackTitles = []; // reset
    event.preventDefault();
    calculateAndDisplayRoute(directionsService, directionsDisplay);
    };
    document.getElementById('js-submit').addEventListener('click', onChangeHandler);
}

//generate Google Maps route from user input
function calculateAndDisplayRoute(directionsService, directionsDisplay) {
  directionsService.route({
    origin: document.getElementById('start').value,
    destination: document.getElementById('end').value,
    travelMode: 'DRIVING',
    //avoidTolls: true
  }, function(response, status) {
    if (status === 'OK') {
      directionsDisplay.setDirections(response);
      findCities(response);
    } else {
      window.alert('Directions request failed due to ' + status);
    }
  });
}

//parse map JSON to get cities' latlng from the steps' end locations
function findCities(serviceResponse) {
  console.log('starting findCities');
  let routeLeg = serviceResponse.routes[0].legs[0];
  let longSteps = routeLeg.steps.filter(step => step.distance.value > 1600);
  let locationList = [];
  longSteps.forEach(city => {
    locationList.push(city.end_location.lat().toFixed(6) + ',' + city.end_location.lng().toFixed(6));
  })
  locationListStr = locationList.join('&location=');
   $.when(reverseGeoCode(locationListStr)).done(function() {
      console.log('I found these cities on your route:');
      console.log(citiesList);
      findTracks(citiesList);
   } ); 
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

//parse geocode JSON and generate the cities array
function createCitiesList(response) {
  console.log('starting createCitiesList');
  response.results.forEach(function(result) {
    cityName = result['locations'][0]['adminArea5'];
    //cleanse city results
    if(!cityName.match(/North|East|South|West/) && citiesList.indexOf(cityName) === -1 && cityName !== undefined) {
        citiesList.push(cityName);
      }
    });
  }

// Click link and copy/paste new token
// https://accounts.spotify.com/authorize?client_id=eb2d914cc86b4ee48be7a0ad18df13ec&redirect_uri=https:%2F%2Fdavelarimore.github.io%2Ftrip-tunes&scope=playlist-modify-public&response_type=token


function parseURLHash () {
    const search = location.hash.substring(1);
    const urlHash = search?JSON.parse('{"' + search.replace(/&/g, '","').replace(/=/g,'":"') + '"}', function(key, value) {
    return key===""?value:decodeURIComponent(value)
  }):{}
    return urlHash;
}
urlHash = parseURLHash();
const accessToken = urlHash.access_token;


// iterate through cities list, query for track titles in Spotify using cities
function findTracks(citiesList) {
  let songsNotFound = 0;
  console.log('starting findTracks');
  citiesList.forEach(function(city) {
    $.ajax({
      url: 'https://api.spotify.com/v1/search',
      headers: {
        'Authorization': 'Bearer ' + "'" + accessToken + "'"
      },
      data: {
        q: 'track:'+ '"' + city + '"',
        type: 'track',
        market: 'US',
        limit: 10
      },
    }).done(function(data) {
      if (data.tracks.total === 0){
        songsNotFound++;
      }
      else {
      let eligibleTracks = data.tracks.items.filter(function(track) {
        //cleanse track results
        return !track.name.match(/feat.|Feat.|featuring|Remix|Live|Recorded|Version|Edit/)
      });
      //get a random track for variety
      if (eligibleTracks.length !== 0){
        let chosenTrack = eligibleTracks[Math.floor(Math.random() * eligibleTracks.length)];
          console.log('Found track: ' + chosenTrack.name);
          trackTitles.push({"name": chosenTrack.name, "artist": chosenTrack.artists[0].name, "album": chosenTrack.album.name, "image": chosenTrack.album.images[2].url});
        } else {
        songsNotFound++;
      }
        if(trackTitles.length === citiesList.length - songsNotFound) {
          renderTracks();
          console.log('Done looking for tracks');
          }
      }})
    })
}

// do something with the tracks
function renderTracks() {
    console.log('I found these tracks:');
    console.log(trackTitles);
    const results = trackTitles.map((item, index) => renderTrack(item));
    $('.js-search-results').html(results);
}


function renderTrack(result) {
  return `<div class="result"><img src="${result.image}" title="${result.name}" alt="${result.name}"/><div class="info"><p><span>${result.name}</span></p><p>Artist: ${result.artist} | Album: ${result.album}</p></div></div>`;
}
