fjs.ui.ConferencesWidgetController = function($scope, conferenceService, httpService) {
    var context = this;
    $scope.warning = "";
	$scope.tab = 'my';
	
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
    };
    
    $scope.filterConferenceFn = function(query) {
        return function(conference){
            return conference.pass(query);
        };
    };

    $scope.getAvatarUrl = function(conference, index) {
        if (conference.members) {
            if (conference.members[index] !== undefined) {
                var xpid = conference.members[index].contactId;
                return httpService.get_avatar(xpid,28,28);
            }
            else
                return 'img/Generic-Avatar-28.png';
        }
        else
            return 'img/Generic-Avatar-28.png';
    };

    $scope.$on("conferences_updated", function(event,data){
        $scope.conferences = data.conferences;
        $scope.$safeApply();
    });

};