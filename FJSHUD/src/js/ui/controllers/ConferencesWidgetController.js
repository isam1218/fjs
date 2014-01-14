namespace("fjs.ui");

fjs.ui.ConferencesWidgetController = function($scope, dataManager) {
    fjs.ui.Controller.call(this, $scope);
    var context = this;
    var conferencesModel = dataManager.getModel("conferences");
    var conferenceMembersModel = dataManager.getModel("conferencemembers");
    conferencesModel.addListener("complete", $scope.$safeApply);
    conferenceMembersModel.addListener("complete", $scope.$safeApply);

    this.sortingKey = "conferences";
    this.defaultSortMode = "location";
    this.selectedSortMode = undefined;
    this.sortMenuItems = {location:"Location", number: "Room Number", activity: "Activity"};

    var sortChangeListener = function(data){
        context.selectedSortMode = data.entry.value;
        $scope.$safeApply(function(){
            $scope.sortedBy = context.getSortedByName();
        });
    };
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

    dataManager.getModel("server").addListener("complete", $scope.$safeApply);

    $scope.conferenceMembers = conferencesModel.membersOrder;
    $scope.talkingMembers = conferencesModel.talkingMembersOrder;
    $scope.conferences = conferencesModel.order;
    $scope.occupiedConferences = conferencesModel.occupiedConferences;
    $scope.query = "";
    $scope.$on("$destroy", function() {
        conferencesModel.removeListener("complete", $scope.$safeApply);
        conferenceMembersModel.removeListener("complete", $scope.$safeApply);
        dataManager.getModel("server").removeListener("complete", $scope.$safeApply);
        dataManager.getModel("sortings").removeXpidListener(context.sortingKey, sortChangeListener);

    });
    $scope.unpin = function() {
        //dataManager.runApp("conferences");
    };
    $scope.isMyConference = function(conference){
        return conference.isEditEnabled();
    };
    $scope.openConferenceDetail = function(conferenceId) {
        //dataManager.runApp("conferences");
    };
    $scope.sortedBy = this.getSortedByName();
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
    $scope.showSortMenu = function(e) {
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
        $scope.$emit("showPopup", {key:"SortMenuPopup", x:100, y:200, model: model, id:"conferences"});
        return false;
    };
    $scope.filterConferenceFn = function(query) {
        return function(conference){
            return conference.pass(query);
        };
    };
    sortModel.addXpidListener(this.sortingKey, sortChangeListener);

};

fjs.ui.ConferencesWidgetController.extend(fjs.ui.Controller);