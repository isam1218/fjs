/**
 * Created by fnf on 15.01.14.
 */fjs.core.namespace("fjs.ui");


fjs.ui.ConversationWidgetCallLogController = function($scope, $routeParams, $timeout, $filter, httpService,utilService,contactService) {
    $scope.contactId = $routeParams.contactId;
    $scope.calllogs = [];    

    httpService.getFeed("calllog")
    $scope.$on('calllog_synced', function(event,data){
        $scope.calllogs = data;
        $scope.$safeApply();
    });
	//converting contactid from hex to regular decimal format because the regular decimal format is used for the call log contact ids
    $scope.contactId = parseInt('0x' + $routeParams.contactId.split("_")[0]) + "_" + $routeParams.contactId.split("_")[1];

    var contact = contactService.getContact($scope.contactId);

    var update = function(data) {
        if(data.xpid == $scope.contactId) {
            if(!$scope.contact) {
                $scope.contact = contactModel.items[$scope.contactId];
            }
            updateFavicon();
            $scope.$safeApply();
        }
    };

    $scope.get_avatar = function(xpid){
        return httpService.get_avatar(xpid,40,40);
    }

    $scope.formate_date = function(time){
        return utilService.formatDate(time);
    }

    $scope.formatDuration = function(time){
        return utilService.formatDuration(time);
    }

    $scope.getCalllogTypeImg = function(calllog){
        if(calllog.missed){
            return "img/XIcon-CallLog-Missed.png?v=1418381374907";
        }else{
            return "img/XIcon-CallLog-Outbound.png?v=1418381374907";
        }
    }

    /*var onDurationTimeout = function() {
        if($scope.contact && $scope.contact.hasCall()) {
            var date = Date.now();
            var time = date + (new Date(1).getTimezoneOffset() * 1000 * 60);
            var timeDur = time - $scope.contact.calls_startedAt;
            $scope.duration = $filter('date')(new Date(timeDur), 'HH:mm:ss ');
        }
        durationTimer = $timeout(onDurationTimeout, 1000);
    };*/

    //onDurationTimeout();

    /*contactModel.addEventListener("push", update);

    function updateFavicon() {
        var link = document.getElementById("favicon");
        if(link) {
            link.href = $scope.contact.getAvatarUrl(32,32);
            document.title= $scope.contact.displayName;
        }
    }*/


    /*$scope.$on("$destroy", function() {
        contactModel.removeEventListener("push", update);
        if (durationTimer) {
            $timeout.cancel(durationTimer);
        }
    });*/
};

fjs.core.inherits(fjs.ui.ConversationWidgetCallLogController, fjs.ui.Controller)
