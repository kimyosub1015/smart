function Weather($scope, $interval, $http, GeolocationService) {

	var language = (typeof config.general.language !== 'undefined') ? config.general.language.substr(0, 2) : "en"
	var geoposition = {}
	var weather = {}

	weather.get = function () {
		return $http.jsonp('https://api.darksky.net/forecast/' + config.forecast.key + '/' +
            geoposition.coords.latitude + ',' + geoposition.coords.longitude + '?units=' +
            config.forecast.units + "&lang=" + language + "&callback=JSON_CALLBACK")
            .then(function (response) { //then을 통해 (weathrt.forecast)객체로 json데이터를 넣어줌..
	return weather.forecast = response;	//angular에서 json데이터를 가져올때 $http.jsonp(json이포함된url)&callback=JSON_CALLBACK을 사용
});
	};

	weather.minutelyForecast = function () {
		if (weather.forecast === null) {
			return null;
		}
		return weather.forecast.data.minutely;
	}

    //Returns the current forecast along with high and low tempratures for the current day
	weather.currentForecast = function () {
		if (weather.forecast === null) {
			return null;
		}
		weather.forecast.data.currently.day = moment.unix(weather.forecast.data.currently.time).format('ddd');	//moment.unit()는 유닉스시간->유니코드시간으로 바꿔줌
		weather.forecast.data.currently.temperature = parseFloat(weather.forecast.data.currently.temperature).toFixed(0); //parseFloat()은 정수든 소수든 다 불러온다.(문자는 NAN이 뜬다.) 중간에 공백이 있어도 데이터만 뜨고 20 10 이 있을때 앞의 숫자만 뜬다.
		weather.forecast.data.currently.wi = "wi-forecast-io-" + weather.forecast.data.currently.icon;		//toFixed()는 ()안의 숫자자리수 만큼 소수자리를 나타낸다.
		weather.forecast.data.currently.iconAnimation = weather.forecast.data.currently.icon; //icon은 rain sunny를 나타냄. (json 데이터에서)
		return weather.forecast.data.currently;		//위의 wi-forecast-io- 는 weather아이콘을 나타내는것으로 이폴더html - main index.html(class에 이름 지정) - app/css/weather-icons.css , -app/fonts/사이트 깃파일들 다 넣기(fonts)관련
	}												//http://erikflowers.github.io/weather-icons/  <<- 여기 사이트에 사용법 나옴

	weather.weeklyForecast = function () {
		if (weather.forecast === null) {
			return null;
		}
        // Add human readable info to info
		for (var i = 0; i < weather.forecast.data.daily.data.length; i++) {
			weather.forecast.data.daily.data[i].day = moment.unix(weather.forecast.data.daily.data[i].time).format('ddd');
			weather.forecast.data.daily.data[i].temperatureMin = parseFloat(weather.forecast.data.daily.data[i].temperatureMin).toFixed(0);
			weather.forecast.data.daily.data[i].temperatureMax = parseFloat(weather.forecast.data.daily.data[i].temperatureMax).toFixed(0);
			weather.forecast.data.daily.data[i].wi = "wi-forecast-io-" + weather.forecast.data.daily.data[i].icon;
			weather.forecast.data.daily.data[i].counter = String.fromCharCode(97 + i);	//fromCharCode()는 숫자 유니코드->문자열 변환해준다.
			weather.forecast.data.daily.data[i].iconAnimation = weather.forecast.data.daily.data[i].icon;
		}
		return weather.forecast.data.daily;
	}

	weather.hourlyForecast = function () {
		if (weather.forecast === null) {
			return null;
		}
		weather.forecast.data.hourly.day = moment.unix(weather.forecast.data.hourly.time).format('ddd')
		return weather.forecast.data.hourly;
	}

	GeolocationService.getLocation({ enableHighAccuracy: true }).then(function (geopo) {
		geoposition = geopo;
		refreshWeatherData(geoposition);
		$interval(refreshWeatherData, config.forecast.refreshInterval * 60000 || 7200000)
	});

	function refreshWeatherData() {
		weather.get().then(function () {
			$scope.currentForecast = weather.currentForecast();
			$scope.weeklyForecast = weather.weeklyForecast();
			$scope.hourlyForecast = weather.hourlyForecast();
			$scope.minutelyForecast = weather.minutelyForecast();
		}, function (err) {
			console.error(err)
		});
	}
}

angular.module('SmartMirror')
    .controller('Weather', Weather);	//여기서 두번째 Weather는 맨위의 Weather()을 가져온다.
