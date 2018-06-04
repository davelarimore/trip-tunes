let citiesList = [];

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
	let listLength = Math.floor(routeLeg.distance.value / 320000); //one city every 200mi
    console.log(serviceResponse.routes[0].legs[0]);
    console.log('list will have length ' + listLength);
    console.log('total route in meters is ' + routeLeg.distance.value); //meters
    console.log('first route step in meters is ' + routeLeg.steps[0].distance.value); //meters
    console.log('first route step lat/lon ' + routeLeg.steps[0].end_location.lat() + " " + routeLeg.steps[0].end_location.lng());
    let longSteps = routeLeg.steps.filter(step => step.distance.value > 1600);
    console.log(longSteps);
    longSteps.forEach(city => {
    	//citiesList.push(city.end_location.lat() + "," + city.end_location.lng());
    	reverseGeoCode(city.end_location.lat().toFixed(6), city.end_location.lng().toFixed(6));
    })
    console.log(citiesList);
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

function parseURLHash () {
    var search = location.hash.substring(1);
    var urlHash = search?JSON.parse('{"' + search.replace(/&/g, '","').replace(/=/g,'":"') + '"}',
                     function(key, value) { return key===""?value:decodeURIComponent(value) }):{}
    return urlHash;
}
urlHash = parseURLHash();
const accessToken = urlHash.access_token;

function searchSongs(city) {
      $.ajax({
        url: 'https://api.spotify.com/v1/search',
        headers: {
          'Authorization': 'Bearer ' + accessToken
        },
        data: {
          q: 'track:'+ city,
          type: 'track',
          market: 'US',
          limit: 5
        },
        success: function (response) {
          let trackTitles = [];
          for (i=0; i < response.tracks.items.lengthl i++) {
          trackTitles.push(response.tracks.items[i].name)
        }
          console.log(trackTitles);
        }
    });
}