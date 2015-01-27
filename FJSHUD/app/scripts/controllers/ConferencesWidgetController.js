fjs.core.namespace("fjs.ui");

fjs.ui.ConferencesWidgetController = function($scope,conferenceService,httpService, $route) {
    fjs.ui.Controller.call(this, $scope);
    var context = this;
     $scope.param = $route.path();
    $scope.warning = "";
    if($scope.param == "/conferences/all"){
       $scope.warning = "You may have limited control over some rooms in this list, such as adding or removing other users.";
    }else{
       $scope.warning = "These are the rooms that you have advanced permissions to use, such as adding or removing other users.";
    }
    httpService.getFeed("conferences");
    httpService.getFeed("conferencestatus");
    httpService.getFeed("conferencemembers");
    httpService.getFeed("conferencepermissions");
    httpService.getFeed("server");
    this.sortingKey = "conferences";
    this.defaultSortMode = "location";
    this.selectedSortMode = undefined;
    this.sortMenuItems = {location:"Location", number: "Room Number", activity: "Activity"};

   

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
  

    $scope.query = "";
    
    $scope.isMyConference = function(conference){
        return conference.isEditEnabled();
    };
    $scope.openConferenceDetail = function(conferenceId) {
        //fdp.runApp("conferences");
    };
    $scope.hideNote = false;
  
    $scope.findFreeAndJoin = function(){
     //   var conference = conferencesModel.getFreeConferenceRoomToJoin();
        if(conference){
            conference.joinMe();
        }
    };
    $scope.findMyFreeAndJoin = function(){
       // var conference = conferencesModel.getMyFreeConferenceRoomToJoin();
        /*if(conference){
            conference.joinMe();
        }*/
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