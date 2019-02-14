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

var app = angular.module('SmartMirror');
app.controller('backimg', function ($scope, $interval, $timeout) {

    var texts = ['C:\\study\\smart mirror\\app\\img\\1.jpg','C:\\study\\smart mirror\\app\\img\\2.jpg','C:\\study\\smart mirror\\app\\img\\3.jpg'];
    var textIndex = 0;
    var direction = 1; // 1: fade in, 0: fade out
  
    var fadeInLength = 5000; // ms
    var fadeOutLength = 3000; // ms
    var updateRate = 100; // ms
  
    var fadeInIncrement = 1 / (fadeInLength / updateRate);
    var fadeOutDecrement = 1 / (fadeOutLength / updateRate);
  
    $scope.text = texts[textIndex];
    $scope.opacity = 0;
  
    var fader = $interval(function () {
      if (direction === 1) {
        $scope.opacity = $scope.opacity + fadeInIncrement;
      } else {
        $scope.opacity = $scope.opacity - fadeOutDecrement;
      }
      
      if (direction === 1 && $scope.opacity >= 1) {
        direction = 0;
      } else if (direction === 0 && $scope.opacity <= 0) {
        textIndex = textIndex + 1;
        $scope.text = texts[textIndex % texts.length];
        direction = 1;
      }
    }, updateRate);
    
    $scope.$on('$destroy', function () {
      $interval.cancel(fader);
      fader = undefined;
    });
  });
