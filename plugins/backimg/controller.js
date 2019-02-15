function Img(SpeechService,   Focus) {

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
app.controller('backimg', function ($scope, $interval) {

  var texts = ['app/img/picture1.jpg',
  'app/img/picture2.jpg',
  'app/img/picture3.jpg',
  'app/img/picture4.jpg',
  'app/img/picture5.jpg',
  'app/img/picture6.jpg',
  'app/img/picture7.jpg',
  'app/img/picture8.jpg',
  'app/img/picture9.jpg',
  'app/img/picture10.jpg'];
    var textIndex = 0;
    var direction = 1; // 1: fade in, 0: fade out
  
    var fadeInLength = 5000; // ms
    var fadeOutLength = 3000; // ms
    var updateRate = 100; // ms
    var blackoutRate = 2000;

    var fadeInIncrement = 1 / (fadeInLength / updateRate);
    var fadeOutDecrement = 1 / (fadeOutLength / updateRate);
  
    $scope.text = texts[textIndex];
    $scope.opacity = 0;
  
    var fader = $interval(function () {
      if (direction === 1) {
        setTimeout(function () {
          $scope.$apply(function () {
            $scope.opacity = $scope.opacity + fadeInIncrement;
          });
        }, blackoutRate);
      } else {
        setTimeout(function () {
          $scope.$apply(function () {
            $scope.opacity = $scope.opacity - fadeOutDecrement;
          });
        }, blackoutRate);
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
