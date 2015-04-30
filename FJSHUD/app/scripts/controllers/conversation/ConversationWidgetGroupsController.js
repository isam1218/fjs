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
        $rootScope.$broadcast('recentAdded', {info: xpid});
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
        var isMember = false;
        var isShared = false;

        for (var j = 0; j < $scope.groups.length; j++){
            // iterating thru array of groups...

            // take each group (each group has a 'members' property)
            // singleGroup = {members: [{},{},{}]}
            var singleGroup = $scope.groups[j];

            // take each member in that group...
            // members = [{},{},{}]
            var members = singleGroup.members;

            for (var k = 0; k < members.length; k++){
            // for each member obj in the group...
                var singleMember = members[k];

                // if the member's contact id matches the scope's contact id
                if (singleMember.contactId === $scope.contactId){
                    // console.log('$scope is --- ', $scope);
                    // console.log('$SCOPE.CONTACTID IS - ', $scope.contactId)
                    // then profile clicked on ($scope) is a member of that group
                    isMember = true;
                }

                // if the contact id of that member matches the USER/scope-meModel's pid...
                if (singleMember.contactId === $scope.meModel.my_pid){
                    // console.log('$SCOPE.MEMODEL.MY_PID IS - ', $scope.meModel.my_pid)
                    // then current user is a member of that group 
                    isShared = true;
                }
            }

            // console.log('$SHAREDGROUPS CONSISTS OF - ', $scope.sharedGroups)
            if (isMember && isShared){
                if (!isGroupIn(singleGroup, $scope.sharedGroups)){

                    // scope and current user are both members of the group
                    $scope.sharedGroups.push(singleGroup);
                }
            } else if (isMember){
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