hudweb.controller('TopNavigationController',['$scope', 'UtilService',function($scope, utilService) {

    $scope.meModel = {};
    $scope.permissions = {
        Zoom: {bit:1,enabled:false}
    };


    $scope.appIcons = [
        {title:"Me", url:"#/settings", key:"Me",enabled:1}
        , {title:"Calls and Recordings", url:"#/calllog", key:"CallLog",enabled:1}
        , {title:"Conferencing", url:"#/conferences", key:"Conferences", enabled:1}
        , {title:"Call Center", url:"#/callcenter", key:"CallCenter",enabled:1}
        , {title:"Search", url:"#/search", key:"Search",enabled:1}
        , {title:"Video Collaboration", url:"#/zoom", key:"Zoom",enabled:1}
        , {title:"Box", url:"#/box", key:"Box",enabled:1}
    ];

    $scope.filterTopBar = function(enabled){
        if(enabled == 0){
            return false;
        }else{
            return true;
        }
    }

    $scope.$on('me_synced', function(event,data){
        if(data){
            var me = {};
            for(medata in data){
                $scope.meModel[data[medata].propertyKey] = data[medata].propertyValue;
            }
        }

        var permissions = parseInt($scope.meModel.personal_permissions);
        
        for(perm in $scope.permissions){

            $scope.permissions[perm].enabled = utilService.isEnabled(
                permissions,
                $scope.permissions[perm].bit
            )

            for(app in $scope.appIcons){
                if($scope.appIcons[app].key == perm){
                    $scope.appIcons[app].enabled = $scope.permissions[perm].enabled;
                }
            }

        }

        $scope.$apply();
    });

    $scope.$on("$destroy", function() {
	
    });

}]);