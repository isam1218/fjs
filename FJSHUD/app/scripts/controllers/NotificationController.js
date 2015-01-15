

fjs.core.namespace("fjs.ui");

fjs.ui.NotificationController = function($scope, myHttpService,$location){

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

	$scope.remove_notification = function(xpid){
		for(i = 0; i < $scope.notifications.length; i++){
			if($scope.notifications[i].xpid == xpid){
				$scope.notifications.splice(i,1);
				break;
			}
		}
		for(i = 0; i < $scope.todaysNotifications.length; i++){
			if($scope.todaysNotifications[i].xpid == xpid){
				$scope.todaysNotifications.splice(i,1);
				break;
			}	
		}
		myHttpService.sendAction('quickinbox','remove',{'pid':xpid});
		$scope.$apply();
	}

	$scope.get_away_notifications= function(){
		away_notifications = $scope.notifications.filter(function(item){
			return item.receivedStatus == "away"; 
		});

		return away_notifications;
	}
	
	$scope.remove_all = function(){

		$scope.notifications = [];
		$scope.todaysNotifications = [];

		myHttpService.sendAction('quickinbox','removeAll');
			
	}

	$scope.go_to_notification_chat = function(xpid){
		$location.path("/contact/" + xpid);
		$scope.remove_notification(xpid);
		$scope.showOverlay(false);
	}

	$scope.showOverlay = function(show) {
		if (!show)
			$scope.overlay = '';
		else if ($scope.tab != 'groups')
			$scope.overlay = 'contacts';
		else
			$scope.overlay = 'groups';
	};

	$scope.$on('quickinbox_synced', function(event,data){
		
		if(data){
			data.sort(function(a,b){
				return b.time - a.time;
			});

			if($scope.notifications && $scope.notifications.length > 0){
				for(notification in data){
					for(i = 0; i < $scope.notifications.length;i++){
						if($scope.notifications[i].xpid == data[notification].xpid){
							$scope.notifications.splice(i,1,data[notification]);
							break;	
						}
						$scope.notifications.push(data[notification]);
					}
				}
			}else{
				$scope.notifications = data;
			}
		}

		$scope.todaysNotifications = $scope.notifications.filter(function(item){
			currentDate = new Date();
			itemDate = new Date(item.time);

			if(currentDate.getDate() == itemDate.getDate()){
				if(currentDate.getMonth() == itemDate.getMonth()){
					return true;
				}
			}
			return false;
		});
		
		$scope.$apply();
	});
}

fjs.core.inherits(fjs.ui.NotificationController, fjs.ui.Controller)