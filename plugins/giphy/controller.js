function Giphy($scope, $http, SpeechService, Focus) {

    //Show giphy image
	SpeechService.addCommand('image_giphy', function () {
		$http.get("http://api.giphy.com/v1/gifs/random?api_key=dc6zaTOxFJmzC&tag=api_giphy_header.gif")
            .then(function (response) {
	$scope.gifimg = response.data.data.image_url;
	Focus.change("gif");
})
	});
}

angular.module('SmartMirror')
    .controller('Giphy', Giphy);
