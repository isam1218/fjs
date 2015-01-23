fjs.core.namespace("fjs.ui");

fjs.ui.ConferencesWidgetController = function($scope, dataManager,conferenceService,httpService, $route) {
    fjs.ui.Controller.call(this, $scope);
    var context = this;
    var conferencesModel = dataManager.getModel("conferences");
     $scope.param = $route.path();
    var conferenceMembersModel = dataManager.getModel("conferencemembers");
    conferencesModel.addEventListener("complete", $scope.$safeApply);
    conferenceMembersModel.addEventListener("complete", $scope.$safeApply);
    $scope.warning = "";
    if($scope.param == "/conferences/all"){
       $scope.warning = "You may have limited control over some rooms in this list, such as adding or removing other users.";
    }else{
       $scope.warning = "These are the rooms that you have advanced permissions to use, such as adding or removing other users.";
    }
    httpService.getFeed("conference");
    httpService.getFeed("conferencestatus");
    httpService.getFeed("conferencemembers");
    httpService.getFeed("conferencepermissions");
    httpService.getFeed("server");
    this.sortingKey = "conferences";
    this.defaultSortMode = "location";
    this.selectedSortMode = undefined;
    this.sortMenuItems = {location:"Location", number: "Room Number", activity: "Activity"};

    /*var sortChangeListener = function(data){
        context.selectedSortMode = data.entry.value;
        $scope.$safeApply(function(){
            $scope.sortedBy = context.getSortedByName();
        });
    };*/
    var /** @type{fjs.hud.SortingFeedModel}*/ sortModel =  dataManager.getModel("sortings");

    $scope.getSortMode = function(){
        return context.selectedSortMode || context.defaultSortMode;
    };
    this.setSortMode = function(sortMode){
        sortModel.actionSort(context.sortingKey, sortMode);
    };
    this.getSortedByName = function(){
        return this.sortMenuItems[$scope.getSortMode()]||this.sortMenuItems[this.defaultSortMode];
    };
    $scope.sortedBy = this.getSortedByName();
   /* $scope.showSortMenu = function(e) {
        e.stopPropagation();
        var items = [];
        for (var id in context.sortMenuItems){
            if(context.sortMenuItems.hasOwnProperty(id)){
                items.push({"id": id, "name": context.sortMenuItems[id], "selected": $scope.getSortMode() == id});
            }
        }
        var model = {};
        model.items = items;
        model.callback = context.setSortMode;
        var eventTarget = context.getEventHandlerElement(e.target, e);
        var offset = fjs.utils.DOM.getElementOffset(eventTarget);
        $scope.$emit("showPopup", {key:"SortMenuPopup", x:offset.x, y:offset.y+30, model: model, id:"conferences"});
        return false;
    };*/

    //sortModel.addXpidListener(this.sortingKey, sortChangeListener);

    //dataManager.getModel("server").addEventListener("complete", $scope.$safeApply);

    /*$scope.conferenceMembers = conferencesModel.membersOrder;
    $scope.talkingMembers = conferencesModel.talkingMembersOrder;
    $scope.conferences = conferencesModel.items;
    $scope.occupiedConferences = conferencesModel.occupiedConferences;*/
    $scope.query = "";
    /*$scope.$on("$destroy", function() {
        conferencesModel.removeEventListener("complete", $scope.$safeApply);
        conferenceMembersModel.removeEventListener("complete", $scope.$safeApply);
        dataManager.getModel("server").removeEventListener("complete", $scope.$safeApply);
        dataManager.getModel("sortings").removeXpidListener(context.sortingKey, sortChangeListener);

    });
    $scope.unpin = function() {
        //fdp.runApp("conferences");
    };*/
    $scope.isMyConference = function(conference){
        return conference.isEditEnabled();
    };
    $scope.openConferenceDetail = function(conferenceId) {
        //fdp.runApp("conferences");
    };
    $scope.hideNote = false;
    $scope.isFindFreeAndJoinDisabled = !conferencesModel.getFreeConferenceRoomToJoin();
    $scope.isFindMyFreeAndJoinDisabled = !conferencesModel.getMyFreeConferenceRoomToJoin();

    $scope.findFreeAndJoin = function(){
        var conference = conferencesModel.getFreeConferenceRoomToJoin();
        if(conference){
            conference.joinMe();
        }
    };
    $scope.findMyFreeAndJoin = function(){
        var conference = conferencesModel.getMyFreeConferenceRoomToJoin();
        if(conference){
            conference.joinMe();
        }
    };
    $scope.filterConferenceFn = function(query) {
        return function(conference){
            return conference.pass(query);
        };
    };

    $scope.getAvatarUrl = function(conference, index) {
        
        if(group.members){
            if (group.members[index] !== undefined) {
                var xpid = group.members[index];
                return myHttpService.get_avatar(xpid,14,14);
            }
            else
                return 'img/Generic-Avatar-14.png';

        }
    };


    $scope.$on("conferences_updated", function(event,data){
        $scope.conferences = data.conferences;
        $scope.$safeApply();
    });

};

fjs.core.inherits(fjs.ui.ConferencesWidgetController, fjs.ui.Controller)