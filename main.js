let citiesList = [];
let trackTitles = [];

function initMap() {
let directionsService = new google.maps.DirectionsService;
let directionsDisplay = new google.maps.DirectionsRenderer;
let map = new google.maps.Map(document.getElementById('map'), {
  zoom: 7,
  center: {lat: 41.85, lng: -87.65}
});
directionsDisplay.setMap(map);

let onChangeHandler = function() {
  citiesList = [];
	calculateAndDisplayRoute(directionsService, directionsDisplay);
	};
	document.getElementById('js-submit').addEventListener('click', onChangeHandler);
}

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

function findCities(serviceResponse) {
	let routeLeg = serviceResponse.routes[0].legs[0];
	// let listLength = Math.floor(routeLeg.distance.value / 320000); //one city every 200mi
    // console.log(serviceResponse.routes[0].legs[0]);
    // console.log('list will have length ' + listLength);
    // console.log('total route in meters is ' + routeLeg.distance.value); //meters
    // console.log('first route step in meters is ' + routeLeg.steps[0].distance.value); //meters
    // console.log('first route step lat/lon ' + routeLeg.steps[0].end_location.lat() + " " + routeLeg.steps[0].end_location.lng());
    let longSteps = routeLeg.steps.filter(step => step.distance.value > 1600);
    // console.log(longSteps);
    longSteps.forEach(city => {
    	//citiesList.push(city.end_location.lat() + "," + city.end_location.lng());
    	reverseGeoCode(city.end_location.lat().toFixed(6), city.end_location.lng().toFixed(6));
    })
    console.log('I found these cities on your route:');
    console.log(citiesList);
    renderTracks(citiesList);
}

function reverseGeoCode(lat, lon) {
  let latlon = `${lat},${lon}`;
$.ajax({
  url: "https://open.mapquestapi.com/nominatim/v1/reverse.php?key=eVTA5UuJha1AWdQjzcHPOGrNuPpslvsw&zoom=10&json_callback=convertToCity&format=jsonv2",
  jsonp: "convertToCity",
  dataType: "jsonp",
  data: {
    lat: `${lat}`,
    lon: `${lon}`,
  },
});
}

function convertToCity(data) {
  let cityName = data['address']['city'];
  if(citiesList.indexOf(cityName) === -1 && cityName !== undefined) {
      citiesList.push(cityName);
    }
  //citiesList.push(data['address']['city']);
  //citiesList.city = (data['address']['city']);
  //citiesList.state = (data['address']['state']);
  //citiesList.importance = (data['importance']); //jsonv2
  //citiesList.placeRank = (data['place_rank']); //jsonv2
  //console.log(citiesList);
}

// ======Spotify=======
// https://accounts.spotify.com/authorize?client_id=eb2d914cc86b4ee48be7a0ad18df13ec&redirect_uri=https:%2F%2Fdavelarimore.github.io%2Ftrip-tunes&scope=playlist-modify-public&response_type=token

function parseURLHash () {
    let search = location.hash.substring(1);
    let urlHash = search?JSON.parse('{"' + search.replace(/&/g, '","').replace(/=/g,'":"') + '"}', function(key, value) { return key===""?value:decodeURIComponent(value) }):{}
    return urlHash;
}
urlHash = parseURLHash();
const accessToken = urlHash.access_token;

function searchCity(city) {
          $.ajax({
            url: 'https://api.spotify.com/v1/search',
            headers: {
              'Authorization': 'Bearer ' + accessToken
            },
            data: {
              q: 'track:'+ city,
              type: 'track',
              market: 'US',
              limit: 1
            },
            success: function(response) {
              console.log(response.tracks.items[0].name);
              // return response.tracks.items[0].name;
              trackTitles.push(response.tracks.items[0].name);
            }
        });
      }

function renderTracks(searchList) {
  // trackTitles = searchList.map(searchCity);
  searchList.forEach(searchCity(city));
  console.log('I found these songs based on the cities:');
  console.log(trackTitles);
  }