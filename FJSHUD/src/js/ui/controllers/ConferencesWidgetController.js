namespace("fjs.ui");

fjs.ui.ConferencesWidgetController = function($scope, dataManager) {
    fjs.ui.Controller.call(this, $scope);
    var conferencesModel = dataManager.getModel("conferences");
    var conferenceMembersModel = dataManager.getModel("conferencemembers");
    conferencesModel.addListener("complete", $scope.$safeApply);
    conferenceMembersModel.addListener("complete", $scope.$safeApply);
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
    $scope.hideNote = false;
    $scope.isFindFreeAndJoinDisabled = !conferencesModel.getFreeConferenceRoomToJoin();
    $scope.isFindMyFreeAndJoinDisabled = !conferencesModel.getMyFreeConferenceRoomToJoin();

    $scope.findFreeAndJoinDisabled = function(){
        var conference = conferencesModel.getFreeConferenceRoomToJoin();
        if(conference){
            conference.joinMe();
        }
    };
    $scope.findMyFreeAndJoinDisabled = function(){
        var conference = conferencesModel.getMyFreeConferenceRoomToJoin();
        if(conference){
            conference.joinMe();
        }
    };
    $scope.showSortMenu = function(e) {
        e.stopPropagation();
        $scope.$emit("showPopup", {key:"SortMenuPopup", x:100, y:200});
        return false;
    };

};

fjs.ui.ConferencesWidgetController.extend(fjs.ui.Controller);