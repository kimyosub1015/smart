function SubwayService($scope, SpeechService, Focus) {
	var Service = {};

    //input(station) 역이름을 입력해서 정보 얻기. 얻은 정보는 Service.arriveTime에 넣는다.
	Service.getArrivedata = function(station){
		var data;
		var url ="http://swopenapi.seoul.go.kr/api/subway/sample/json/realtimeStationArrival/0/5/"+station;
		var xhr = new XMLHttpRequest();
		xhr.open('GET', url, false); //true:비동기 false:동기
		xhr.onreadystatechange = function() {
			data = xhr.responseText;
			Service.arriveTime = JSON.parse(data);
			console.log(Service.arriveTime);
		};
		xhr.send();
	};

	var changemin = function(time){	// 초 ->분으로 바꿔주는 함수
		var min = Math.floor(time/60);
		var sec = Math.floor(time%60);
		return min + "분 "+ sec + "초"
	};


    // Service.arriveTime에 받는 정보들을 출력작업
	SpeechService.addCommand('subway_show', function (station) {
		Service.getArrivedata(station);
		if(Service.arriveTime != null){
			$scope.subwayinfo1 = station+"역에서 "+Service.arriveTime.realtimeArrivalList[0].updnLine+"방향인 "+Service.arriveTime.realtimeArrivalList[0].bstatnNm + "행 열차가 " + changemin(Service.arriveTime.realtimeArrivalList[0].barvlDt) + " 후 도착예정입니다.";
			$scope.subwayinfo2 = station+"역에서 "+Service.arriveTime.realtimeArrivalList[1].updnLine+"방향인 "+Service.arriveTime.realtimeArrivalList[1].bstatnNm + "행 열차가 " + changemin(Service.arriveTime.realtimeArrivalList[1].barvlDt) + " 후 도착예정입니다.";
			$scope.subwayinfo3 = station+"역에서 "+Service.arriveTime.realtimeArrivalList[2].updnLine+"방향인 "+Service.arriveTime.realtimeArrivalList[2].bstatnNm + "행 열차가 " + changemin(Service.arriveTime.realtimeArrivalList[2].barvlDt) + " 후 도착예정입니다.";
		}
		Focus.change("subway");
	});
    


}

angular.module('SmartMirror')
    .controller('SubwayService', SubwayService);
