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
	calculateAndDisplayRoute(directionsService, directionsDisplay);
	};
	document.getElementById('js-submit').addEventListener('click', onChangeHandler);
}

function calculateAndDisplayRoute(directionsService, directionsDisplay) {
directionsService.route({
  origin: document.getElementById('start').value,
  destination: document.getElementById('end').value,
  travelMode: 'DRIVING'
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
  const query = {
	format: 'json',
	key: 'eVTA5UuJha1AWdQjzcHPOGrNuPpslvsw',
	json_callback: 'convertToCity',
	lat: `${lat}`,
	lon: `${lon}`,
  }
  	console.log(query);
	//$.getJSON('https://open.mapquestapi.com/nominatim/v1/reverse.php', query);
	$.getJSON(`https://open.mapquestapi.com/nominatim/v1/reverse.php?key=eVTA5UuJha1AWdQjzcHPOGrNuPpslvsw&lat=${lat}&lon=${lon}&json_callback=convertToCity`);
}

function convertToCity(json) {
	console.log(json);
	console.log(json.address.city);
	citiesList.push(json.address.city);
	console.log(citiesList);
}
//https://open.mapquestapi.com/nominatim/v1/reverse.php?key=eVTA5UuJha1AWdQjzcHPOGrNuPpslvsw&format=json&lat=39.0982035&lon=-88.5780341
