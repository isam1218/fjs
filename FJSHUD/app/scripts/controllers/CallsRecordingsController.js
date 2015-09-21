hudweb.controller('CallsRecordingsController', ['$scope', '$rootScope', '$routeParams', 'SettingsService','$http','$filter', function($scope, $rootScope, $routeParams, settingsService,$http,$filter) {
	// routing
	$scope.tabs = [{upper: $scope.verbage.call_log_tab, lower: 'calllog'}, {upper:$scope.verbage.voicemail_tab, lower: 'voicemails'}, {upper: $scope.verbage.my_recordings_tab, lower: 'recordings'},{upper: $scope.verbage.my_videos_tab, lower: 'videos'}];
  $scope.setFromLocalStorage = function(val){
    $scope.globalXpid = val;
    if($routeParams.route != undefined){
            $scope.selected = $routeParams.route;
            localStorage['CallsRecordings_tabs_of_' + $scope.globalXpid] = JSON.stringify($scope.selected);

            for(var i = 0, iLen = $scope.tabs.length; i < iLen; i++){
              if($scope.tabs[i].lower == $routeParams.route){
                $scope.toggleObject = {item: i};
                localStorage['CallsRecordings_toggleObject_of_' + $scope.globalXpid] = JSON.stringify($scope.toggleObject);
                break;
              }
            }
    }else{

      $scope.selected = localStorage['CallsRecordings_tabs_of_' + $scope.globalXpid] ? JSON.parse(localStorage['CallsRecordings_tabs_of_' + $scope.globalXpid]) : $scope.tabs[0].lower;
      $scope.toggleObject = localStorage['CallsRecordings_toggleObject_of_' + $scope.globalXpid] ? JSON.parse(localStorage['CallsRecordings_toggleObject_of_' + $scope.globalXpid]) : {item: 0};
    }
  };



	settingsService.getSettings().then(function() {
		$scope.setFromLocalStorage($rootScope.myPid);
	});

  $scope.selected = localStorage['CallsRecordings_tabs_of_' + $scope.globalXpid] ? JSON.parse(localStorage['CallsRecordings_tabs_of_' + $scope.globalXpid]) : $scope.tabs[0].lower;
  $scope.toggleObject = localStorage['CallsRecordings_toggleObject_of_' + $scope.globalXpid] ? JSON.parse(localStorage['CallsRecordings_toggleObject_of_' + $scope.globalXpid]) : {item: 0};
  
  $scope.saveCRTab = function(tab, index){
    $scope.selected = $scope.tabs[index].lower;
    $scope.toggleObject = {item: index};
    localStorage['CallsRecordings_tabs_of_' + $scope.globalXpid] = JSON.stringify($scope.selected);
    localStorage['CallsRecordings_toggleObject_of_' + $scope.globalXpid] = JSON.stringify($scope.toggleObject);
  };

  $scope.tabFilter = function(){
    return function(tab){
      if (tab.lower == 'recordings'){
        var recordingPerm = settingsService.getPermission('showCallCenter');
        if (recordingPerm)
          return true;
        else
          return false;
      }
      return true;
    };
  }; 


     var getURL = function(action) {

    var url = 
       action
       
      + '?fonalityUserId=' + $rootScope.myPid.split('_')[1]
      + '&serverId=' + $rootScope.meModel.server_id
      + '&authToken=' + localStorage.authTicket;
    
    return url;
  };

  settingsService.getSettings().then(function() {
    var date = new Date();
    var month = date.getMonth() + 1;
    var toDate = date.getFullYear() + '-' + month+ '-' + date.getDate();
    var prevMonth = date.getMonth();
    var fromDate =  date.getFullYear() + '-' + prevMonth + '-' + date.getDate();
    $http.get(fjs.CONFIG.SERVER.ppsServer +getURL('zoom/completedMeetingList')+'&email='+$rootScope.meModel.my_jid.split("@")[1]+'&fromDate='+fromDate+'&toDate='+toDate).success(function(response){
            console.log("DATA",response);
            $scope.meetingList = response.meetings;
           
          });
  });

}]);