

fjs.core.namespace("fjs.ui");

fjs.ui.NotificationController = function($scope, myHttpService){

	var weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
	// notifications, TO DO: put in separate controller
	$scope.notifications = [];
	
	myHttpService.getFeed('quickinbox');
	
	$scope.getAvatar = function(pid){
		return myHttpService.get_avatar(pid,40,40);
	}

	$scope.getMessage = function(message){

		switch(message.type){

			case "vm":
				return "Voicemail from extension " + message.phone; 
				break;
			case "chat":
				return message.message;
				break;
			default:
				return message.message;

		
		}
	}
	$scope.convertTime = function(time){
		var date = new Date(time);
		var currentDate = new Date();
		var Hour = date.getHours();
		if(date.getDate() == currentDate.getDate() && date.getFullYear() == currentDate.getFullYear()){

			if(Hour > 12){
				return "today" +  " " + (Hour - 12).toString() + ":" + date.getMinutes() + " pm" ;
			}else{
				return "today" +  " " + Hour.toString() + ":" + date.getMinutes() + " am" ;
			}

		}else{
			if(Hour > 12){
				return weekday[date.getDay()] + " " + (Hour - 12).toString() + ":" + date.getMinutes() + " pm";
		
			}else{
				return weekday[date.getDay()] + " " + (Hour).toString() + ":" + date.getMinutes() + " am";
			}
		}
	}

	$scope.showOverlay = function(show) {
		if (!show)
			$scope.overlay = '';
		else if ($scope.tab != 'groups')
			$scope.overlay = 'contacts';
		else
			$scope.overlay = 'groups';
	};

	$scope.test = {message:'test'};
	$scope.$on('quickinbox_synced', function(event,data){
		
		if(data){
			data.sort(function(a,b){
				return b.time - a.time;
			});

			if($scope.notifications && $scope.notifications.length > 0){
				$scope.notifications.concat(data);
			}else{
				$scope.notifications = data;
			}	
		}

		
		$scope.$apply();
	});
}

fjs.core.inherits(fjs.ui.NotificationController, fjs.ui.Controller)