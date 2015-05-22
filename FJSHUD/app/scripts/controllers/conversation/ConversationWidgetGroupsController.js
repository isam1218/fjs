hudweb.controller('ConversationWidgetGroupsController', ['$scope', '$routeParams', '$rootScope', 'HttpService', 'GroupService', 'SettingsService', '$timeout', 'HttpService', function($scope, $routeParams, $rootScope, myHttpService, groupService, settingsService, $timeout, httpService) {
    var context = this;
    var addedPid;
	var favoriteID;
	
    $scope.contactId = $routeParams.contactId;
    $scope.groups = [];
	$scope.userGroup;
    $scope.que = {};
    $scope.que.query = '';
    $scope.query = "";
	
	groupService.getGroups().then(function(data) {
		$scope.groups = data.groups;
		favoriteID = data.favoriteID;
		
		// find user's department
		var groups = $scope.groups;
		
		for (var i = 0, len = groups.length; i < len; i++) {
			if (!groups[i].ownerId) {
				for (var m = 0, mLen = groups[i].members.length; m < mLen; m++) {
					if (groups[i].members[m].contactId == $scope.contactId) {
						$scope.userGroup = groups[i];
						break;
					}
				}
			}
			
			if ($scope.userGroup) break;
		}
	});

    $scope.$on('pidAdded', function(event, data){
        addedPid = data.info;
        if (localStorage['recents_of_' + addedPid] === undefined){
            localStorage['recents_of_' + addedPid] = '{}';
        }
        $scope.recent = JSON.parse(localStorage['recents_of_' + addedPid]);
    });

    $scope.storeRecentGroup = function(xpid){
        var localPid = JSON.parse(localStorage.me);
        $scope.recent = JSON.parse(localStorage['recents_of_' + localPid]);
        $scope.recent[xpid] = {
            type: 'group',
            time: new Date().getTime()
        };
        localStorage['recents_of_' + localPid] = JSON.stringify($scope.recent);
        $rootScope.$broadcast('recentAdded', {id: xpid, type: 'group', time: new Date().getTime()});
    };

    httpService.getFeed('settings');

    $scope.$on('settings_updated', function(event, data){
        if (data['hudmw_searchautoclear'] == ''){
            autoClearOn = false;
            if (autoClearOn && $scope.que.query != ''){
                    $scope.autoClearTime = data['hudmw_searchautocleardelay'];
                    $scope.clearSearch($scope.autoClearTime);          
                } else if (autoClearOn){
                    $scope.autoClearTime = data['hudmw_searchautocleardelay'];
                } else if (!autoClearOn){
                    $scope.autoClearTime = undefined;
                }
        }
        else if (data['hudmw_searchautoclear'] == 'true'){
            autoClearOn = true;
            if (autoClearOn && $scope.que.query != ''){
                $scope.autoClearTime = data['hudmw_searchautocleardelay'];
                $scope.clearSearch($scope.autoClearTime);          
            } else if (autoClearOn){
                $scope.autoClearTime = data['hudmw_searchautocleardelay'];
            } else if (!autoClearOn){
                $scope.autoClearTime = undefined;
            }
        }
    });

    var currentTimer = 0;

    $scope.clearSearch = function(autoClearTime){
        if (autoClearTime){
            var timeParsed = parseInt(autoClearTime + '000');
            $timeout.cancel(currentTimer);
            currentTimer = $timeout(function(){
                $scope.que.query = '';
            }, timeParsed);         
        } else if (!autoClearTime){
            return;
        }
    };
	
	$scope.customFilter = function() {
		var query = $scope.que.query.toLowerCase();
		
		return function(group) {
			if (group.xpid != favoriteID && group != $scope.userGroup && groupService.isMember(group, $scope.contactId) && groupService.isMine(group.xpid)) {
				if (query == '' || group.name.toLowerCase().indexOf(query) != -1)
					return true;
			}
		};
	};
	
	$scope.isTheirGroup = function() {
		if ($scope.userGroup && $scope.userGroup.name.toLowerCase().indexOf($scope.que.query.toLowerCase()) != -1)
			return true;
	};
	
    $scope.$on("$destroy", function() {
		
    });
}]);