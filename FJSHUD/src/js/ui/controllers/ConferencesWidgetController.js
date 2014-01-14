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
    $scope.getSortMode = function(){
        return context.selectedSortMode || context.defaultSortMode;
    };
    this.updateSortMode = function(){
        dataManager.dataProvider.dataManager.db.selectByKey("sorting", context.sortingKey, function(row){
            if(row){
                $scope.$safeApply(function(){
                    context.selectedSortMode = row.value;
                    $scope.sortedBy = context.getSortedByName();
                });
            }
        });
    };
    this.updateSortMode();
    this.setSortMode = function(sortMode){
        dataManager.dataProvider.dataManager.db.insertOne("sorting", {'id': context.sortingKey, 'value': sortMode});
        context.selectedSortMode = sortMode;
        $scope.sortedBy = context.getSortedByName();
    };
    this.getSortedByName = function(){
        return this.sortMenuItems[$scope.getSortMode()]||this.sortMenuItems[this.defaultSortMode];
    };

    dataManager.getModel("server").addListener("complete", $scope.$safeApply);

    $scope.conferenceMembers = conferencesModel.membersOrder;
    $scope.conferences = conferencesModel.order;
    $scope.query = "";
    $scope.$on("$destroy", function() {
        conferencesModel.removeListener("complete", $scope.$safeApply);
        conferenceMembersModel.removeListener("complete", $scope.$safeApply);
        dataManager.getModel("server").removeListener("complete", $scope.$safeApply);

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
            items.push({"id": id, "name": context.sortMenuItems[id], "selected": $scope.getSortMode() == id});
        }
        var model = {};
        model.items = items;
        model.callback = context.setSortMode;
        $scope.$emit("showPopup", {key:"SortMenuPopup", x:100, y:200, model: model, id:"conferences"});
        return false;
    };


};

fjs.ui.ConferencesWidgetController.extend(fjs.ui.Controller);