hudweb.controller('ConversationWidgetGroupsController', ['$scope', '$routeParams', '$rootScope', 'HttpService', 'GroupService', 'UtilService', function($scope, $routeParams,$rootScope,myHttpService,groupService,utils) {
    var context = this;
    var addedPid;
    $scope.contactGroups = [];
    $scope.sharedGroups = [];
    $scope.meModel = {};
    $scope.contactId = $routeParams.contactId;
    $scope.query = "";
    $scope.add = {};

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
    }
	
    // pull updates from service
    $scope.$on('groups_updated',function(event,data) {
        $scope.groups = data.groups;
        $scope.groups = $scope.groups.filter(function(item){
            return item.members && item.members.length > 0;
        });
       $scope.mine = data.mine;
       update_groups();
    });

    myHttpService.getFeed("me");
    // myHttpService.getFeed("groups");

    myHttpService.getFeed("groupcontacts");

    var update_groups = function(){
        $scope.sharedGroups = [];
        $scope.contactGroups = [];
        for (var j = 0; j < $scope.groups.length; j++){
            var singleGroup = $scope.groups[j];
            var members = singleGroup.members;
            var clickedOnIsAMember = false;
            var imAMember = false
            for (var k = 0; k < members.length; k++){
                var singleMember = members[k];
                // if the group-member's xpid matches the clicked on member's contact id
                if (singleMember.fullProfile.xpid == $scope.contactId){
                    clickedOnIsAMember = true;
                }
                // if the contact id of the group-member matches my USER/scope-meModel's pid...
                if (singleMember.fullProfile.xpid === $scope.meModel.my_pid){
                    // then current user is a member of that group
                    imAMember = true;
                }
            }
            if (clickedOnIsAMember && imAMember){
                if (!isGroupIn(singleGroup, $scope.sharedGroups)){
                    // scope and current user are both members of the group
                    $scope.sharedGroups.push(singleGroup);
                }
            } else if (clickedOnIsAMember){
                if (!isGroupIn(singleGroup, $scope.contactGroups)){
                    $scope.contactGroups.push(singleGroup);
                }
            }
        }
    };

    var isGroupIn = function(groupToInsert, groups){
        groupExist = false;
        for(group in groups){
            if(groupToInsert.xpid == groups[group].xpid){
                groupExist = true;
            }
        }
        return groupExist;
    };

     $scope.getAvatarUrl = function(group, index) {
        if(group.members){
            if (group.members[index] !== undefined) {
                var xpid = group.members[index];
                return myHttpService.get_avatar(xpid,14,14);
            }
            else
                return 'img/Generic-Avatar-14.png';

        } 
    };

        
    var filterGroup = function(){
        return function(group){
            return group.hasContact(context.contactId) && !group.isFavorite();
        };
    };
    //fjs.ui.GroupsTab.call(this, $scope, $routeParams, dataManager, filterGroup);
    $scope.$on("$destroy", function() {
    });

    $scope.$on('me_synced', function(event,data){
        if(data){
            for(medata in data){
                $scope.meModel[data[medata].propertyKey] = data[medata].propertyValue;
            }
        }
    });
}]);