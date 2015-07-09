hudweb.controller('ZoomWidgetController', ['$scope', '$http', 'HttpService', function($scope, $http,httpService) {
    $scope.joinMeeting = function(meetingId){
        window.open("https://api.zoom.us/j/" + meetingId,'_blank');
    };

    $scope.hasResult = false;
    $scope.startUrl = "";
    $scope.joinUrl = "";

    $scope.inMeeting = false;
    $scope.startMeeting = function(option){
        var data = {};
        var users = "";

        for (var i = 0, iLen = $scope.addedContacts.length; i < iLen; i++) {
            users = users + $scope.addedContacts[i].xpid + ",";
        }

        data["topic"]="";
        data["users"]= users;
        data["option_start_type"]= option;
        $http({
            method:'POST',
            url:fjs.CONFIG.SERVER.serverURL + "/v1/zoom",
           data: $.param(data),
           headers:{
                'Authorization': 'auth=' + localStorage.authTicket,//'auth=7aa21bf443b5c6c7b5d6e28a23ca5479061f36f5181b7677',
                'node':localStorage.nodeID,//'afdp37_1',
                'Content-Type':'application/x-www-form-urlencoded',
            }
        }).then(function(response){
            var data = response;
            $scope.startUrl = response.data.start_url;
            $scope.joinUrl = response.data.join_url;
            window.open($scope.startUrl, '_blank');
            $scope.inMeeting = true;
            $scope.$safeApply();

        });
        /*dataManager.sendFDPRequest("/v1/zoom", data, function(xhr, data, isOk) {
               context.onAjaxResult(isOk, data)
        });*/
    };

    $scope.bodyDisplay=true;

    $scope.bodyStartedDisplay=false;

    $scope.bodyErrorDisplay=false;

    $scope.startUrl = "";

    $scope.joinUrl = "";
    
    $scope.addedContacts = [];
    $scope.searchContact = function(contact){
        $scope.addedContacts.push(contact);
    };

     $scope.getAvatarUrl = function(xpid,width, height) {
        if(xpid){
            return httpService.get_avatar(xpid,width,height);
        }
    };


    $scope.deleteContact = function(contactId){
        for (var i = 0, iLen = $scope.addedContacts.length; i < iLen; i++) {
            if($scope.addedContacts[i].xpid == contactId){
                $scope.addedContacts.splice(i,1);
            }
        }
        $scope.$safeApply();
    };

    this.onAjaxResult = function(isOk, _data){
        $scope.hasResult = true;
        if(!isOk){
            $scope.$safeApply(function(){
                $scope.bodyDisplay=false;
                $scope.bodyStartedDisplay=false;
                $scope.bodyErrorDisplay=true;
            });
            return;
        }
        var data = JSON.parse(_data);
        window.open(data["start_url"], '_blank');
        $scope.$safeApply(function(){
            $scope.startUrl = data["start_url"];
            $scope.joinUrl = data["join_url"];

            $scope.bodyDisplay=false;
            $scope.bodyStartedDisplay=(data["start_url"]&&data["join_url"]);
            $scope.bodyErrorDisplay=!$scope.bodyStartedDisplay;
        });
    };
}]);