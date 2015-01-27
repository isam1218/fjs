/**
 * Created by fnf on 15.01.14.
 */fjs.core.namespace("fjs.ui");

/**
 *
 * @param $scope
 * @param $routeParams
 * @param dataManager
 * @constructor
 * @extends fjs.ui.ConversationWidgetController
 * @extends fjs.ui.GroupsTab
 */
fjs.ui.ConversationWidgetGroupsController = function($scope, $routeParams,$rootScope,myHttpService,groupService,utils) {
    var context = this;
    $scope.contactGroups = [];
    $scope.sharedGroups = [];
    $scope.meModel = {};
    $scope.contactId = $routeParams.contactId;
    $scope.query = "";
    $scope.add = {};
    // pull updates from service
    $scope.$on('groups_updated',function(event,data) {
        $scope.groups = data.groups;
        $scope.mine = data.mine;
        $scope.$safeApply();
       update_groups(); 
    });

    myHttpService.getFeed("me");
    myHttpService.getFeed("groups");

    myHttpService.getFeed("groupcontacts");
    update_groups = function(){

        for (i in $scope.groups){
            isMember = false;
            isShared = false;
            members = $scope.groups[i].members;
            if(members.length > 0){
                for(j in members){
                    if(members[j].contactId == $scope.contactId){
                        isMember = true;
                    }

                    if(members[j].contactId == $scope.meModel.my_pid){
                        isShared = true;
                    }

                }
            }

            if(isMember && isShared){
                if(!isGroupIn($scope.groups[i],$scope.sharedGroups)){
                     $scope.sharedGroups.push($scope.groups[i]);
                }
            }else if(isMember){
                if(!isGroupIn($scope.groups[i],$scope.contactGroups)){
                    $scope.contactGroups.push($scope.groups[i]); 
                }
            }
        }

    }

    isGroupIn = function(groupToInsert,groups){
        groupExist = false;
        for(group in groups){
            if(groupToInsert.xpid == groups[group].xpid){
                groupExist = true;
            }
        }
        return groupExist;
    }

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
        $scope.$apply();
    });

    $scope.addGroup = function() {
        // TO DO: validation
        
        $scope.add.contactIds = $rootScope.myPid;
        
        // save
        myHttpService.sendAction('groups', 'addWorkgroup', $scope.add);
        $scope.showOverlay(false);
        $scope.add = {type:2};
    };

    $scope.showOverlay = function(show, edit) {
        //$scope.edit = edit ? edit : false;
        if (!show)
            $scope.$parent.overlay = '';
        else
            $scope.$parent.overlay = 'groups';
    };
};

//fjs.core.inherits(fjs.ui.ConversationWidgetGroupsController, fjs.ui.ConversationWidgetController)
//fjs.core.extend(fjs.ui.ConversationWidgetGroupsController, fjs.ui.GroupsTab);
