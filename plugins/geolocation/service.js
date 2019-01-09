(function () {
	'use strict';

    /*
     var position = {
     latitude: 78.23423423,
     longitude: 13.123124142
     }
     deferred.resolve(position);
     */

	function GeolocationService($q, $rootScope, $window, $http) {
		var service = {};
		var geoloc = null;

		service.getLocation = function () {
			var deferred = $q.defer();	//defer()를 이용하여 동기적 비동기적 함수를 제어한다. 여기선 선언을 한다.

            // Use geo postion from config file if it is defined
			if (typeof config.geoPosition != 'undefined'
                && typeof config.geoPosition.latitude != 'undefined'
                && typeof config.geoPosition.longitude != 'undefined') {

				deferred.resolve({	//보통 사용은 이렇게 하는데 선언된 상태의 결과가 완료된것은 resolve()를 쓰고 실패한것은 reject()를 쓴다. 제어된 값은 promise()를 통해 리턴한다.
					coords: {
						latitude: config.geoPosition.latitude,
						longitude: config.geoPosition.longitude,
					},
				});

			} else {
				if (geoloc !== null) {
					console.log("Cached Geolocation", geoloc);
					return (geoloc);
				}

				$http.get("https://maps.googleapis.com/maps/api/browserlocation/json?browser=chromium").then(
                    function (result) {
	var location = angular.fromJson(result).data.location	//angular.fromJson()는 Json형태의 데이터 -> .NET 형식의 인스턴스로 deserialize한다.(반대경우는 serialize라고 한다)
	deferred.resolve({ 'coords': { 'latitude': location.lat, 'longitude': location.lng } }) //deferred.resolve : 선언된 상태가 완료될때
},
                    function (err) {
	console.debug("Failed to retrieve geolocation.", err)
	deferred.reject("Failed to retrieve geolocation.")//deferred.reject : 선언된 상태가 실패할때
});
			}

			geoloc = deferred.promise;
			return deferred.promise;	//deferred.promise : 는 위에서 제어된 데이터를 리턴한다.
		}

		return service;
	}

	angular.module('SmartMirror')
        .factory('GeolocationService', GeolocationService);

} ());
