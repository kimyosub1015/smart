/*
function helloworld($scope, Focus){
    
    //<img src="../../app/img/picture2.jpg">
    var myHtml = "C:/Users/dytjq/Desktop/smart/app/img/picture"+picnum+".jpg";
    $scope.myHtml = myHtml;
    Focus.change("myHtml");
}

angular.module('SmartMirror')
.controller('helloworld', helloworld);
*/
var picnum = 2;
for(picnum == 2;picnum<10;picnum++){
    angular
    .module('SmartMirror')
    
    // controller here
    .controller('helloworld', function($scope, $timeout) {
                $scope.data = {message:"app\\img\\picture"+picnum+".jpg"};   
    });
}