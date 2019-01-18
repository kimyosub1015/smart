function Img(SpeechService, Focus) {



    // Show map
	SpeechService.addCommand('show_img', function () {
		Focus.change("img");
	});

    // Hide everything and "sleep"
	SpeechService.addCommand('hide_img', function () {
		Focus.change("default");
	});

}

angular.module('SmartMirror')
    .controller('Img', Img);
