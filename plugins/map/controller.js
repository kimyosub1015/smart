function Map($scope, $http, GeolocationService, SpeechService, Focus) {
	var map = {};
	map.center = "37.4981284,127.028303"; //default map locaiton
	map.zoom = 16; //default zoom is 16

    // Get the current location of the mirror
	GeolocationService.getLocation({ enableHighAccuracy: true }).then(function (geoposition) {
		map.center = geoposition.coords.latitude + ',' + geoposition.coords.longitude;
	});

	var generateMap = function (targetCenter, targetZoom) {
		if (targetCenter === undefined) {
			targetCenter = map.center;
		} else {
            //when we change the center of the map keep track of it
			map.center = targetCenter;
		}
		if (targetZoom === undefined) {
			targetZoom = map.zoom;
		}
		return "https://maps.googleapis.com/maps/api/staticmap?center=" + targetCenter + "&zoom=" + targetZoom +
            "&size=" + window.innerWidth + "x" + window.innerHeight +
            "&key=" + config.youtube.key;
	};

	var address = function (station){// 내가 생각하는 해결책은 여기에 아래 만든 번역 함수를 집어넣어 
		var data;
		var temp;
        //var station = decodeURI(station);    //이걸 써도 안먹힌다.
		var url ="https://maps.googleapis.com/maps/api/geocode/json?&address="+station+"&key="+config.youtube.key;
		var xhr = new XMLHttpRequest();
		xhr.open('GET', url, false); //true:비동기 false:동기
		xhr.onreadystatechange = function() {
			data = xhr.responseText;
			temp = JSON.parse(data);
			console.log(temp);
		};
		xhr.send();
		return temp;
	};

    // Show map
	SpeechService.addCommand('map_show', function () {
		$scope.map = generateMap();
		Focus.change("map");
	});

    // Hide everything and "sleep"
	SpeechService.addCommand('map_location', function (location) {
		var loca = address(location);
		map.center = loca.results[0].geometry.location.lat + ',' + loca.results[0].geometry.location.lng;
		$scope.map = generateMap(map.center,map.zoom);
		Focus.change("map");
	});

    // Zoom in map
	SpeechService.addCommand('map_zoom_in', function () {
		map.zoom = map.zoom + 1;
		$scope.map = generateMap();
	});

	SpeechService.addCommand('map_zoom_out', function () {
		map.zoom = map.zoom - 1;
		$scope.map = generateMap();
	});

	SpeechService.addCommand('map_zoom_reset', function () {
		map.zoom = 16;
		$scope.map = generateMap();
	});

	SpeechService.addCommand('map_zoom_point', function (value) {
		if (0 + value < 0 || value == "zero") {
			value = 0
		} else if (0 + value > 18) {
			value = 18
		}
		map.zoom = value;
		$scope.map = generateMap();
	});

}

angular.module('SmartMirror')
    .controller('Map', Map);
