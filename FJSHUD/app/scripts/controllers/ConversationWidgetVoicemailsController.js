/**
 * Created by fnf on 15.01.14.
 */
fjs.ui.ConversationWidgetVoicemailsController = function($scope, $routeParams, $timeout, $filter, contactService,voicemailService,httpService) {
    //fjs.ui.Controller.call(this,  $scope);
    
    $scope.contactId = $routeParams.contactId;
    $scope.data = {};
    $scope.voicemails;     
    //$scope.contact = contactModel.items[$routeParams.contactId];
	httpService.getFeed('voicemailbox');
    contactService.then(function(data) {
        // find this contact
        for (i in data) {
            if (data[i].xpid == $scope.contactID)
                $scope.contact = data[i];
                break;
        }
    });

    $scope.data.contactId = $routeParams.contactId;

    voicemailService.then(function(data){
        $scope.voicemails = data;
        $scope.data.voicemails = data;
    });

    //var voicemail = 
	// override data, where "stack" comes from ng-repeat
    if (typeof $scope.stack !== "undefined") {
		$scope.contactId = $scope.stack.id;
		$scope.contact = contactModel.items[$scope.stack.id];
	}
	

    $scope.formatDuration = function(duration){
        var time =   duration/1000;
        var seconds = time;
        var minutes;
        secString = "00";
        minString = "00";
        if(time >= 60){
            minutes = time/60;
            seconds = seconds - minutes*60;
        }  

        if(minutes < 10){
            minString = "0" + minutes; 
        }
        if(seconds < 10){
            secString = "0" + seconds;  
        }
        return minString + ":" + secString;

    }


    var update = function(data) {
        if(data.xpid == $scope.contactId) {
            if(!$scope.contact) {
                $scope.contact = contactModel.items[$scope.contactId];
            }
            updateFavicon();
            $scope.$safeApply();
        }
    };
    /*var onDurationTimeout = function() {
        if($scope.contact && $scope.contact.hasCall()) {
            var date = Date.now();
            var time = date + (new Date(1).getTimezoneOffset() * 1000 * 60);
            var timeDur = time - $scope.contact.calls_startedAt;
            $scope.duration = $filter('date')(new Date(timeDur), 'HH:mm:ss ');
        }
        durationTimer = $timeout(onDurationTimeout, 1000);
    };

    */

    $scope.$on("",function(){

    });

};

fjs.core.inherits(fjs.ui.ConversationWidgetVoicemailsController, fjs.ui.Controller)
