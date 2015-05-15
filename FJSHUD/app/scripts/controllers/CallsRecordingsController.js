hudweb.controller('CallsRecordingsController', ['$scope', '$rootScope', '$routeParams', '$location', function($scope, $rootScope, $routeParams, $location) {
	// routing
	$scope.tabs = [{upper: $scope.verbage.call_log_tab, lower: 'calllog'}, {upper:$scope.verbage.voicemail_tab, lower: 'voicemails'}, {upper: $scope.verbage.my_recordings_tab, lower: 'recordings'}];
	
  var getXpidInCR = $rootScope.$watch('myPid', function(newVal, oldVal){
      if (!$scope.globalXpid){
          $scope.globalXpid = newVal;
              $scope.selected = localStorage['CallsRecordings_tabs_of_' + $scope.globalXpid] ? JSON.parse(localStorage['CallsRecordings_tabs_of_' + $scope.globalXpid]) : $scope.tabs[0].lower;
              $scope.toggleObject = localStorage['CallsRecordings_toggleObject_of_' + $scope.globalXpid] ? JSON.parse(localStorage['CallsRecordings_toggleObject_of_' + $scope.globalXpid]) : {item: 0};
              getXpidInCR();
      } else {
          getXpidInCR();
      }
  });

  $scope.$on('pidAdded', function(event, data){
      $scope.globalXpid = data.info;
      $scope.selected = localStorage['CallsRecordings_tabs_of_' + $scope.globalXpid] ? JSON.parse(localStorage['CallsRecordings_tabs_of_' + $scope.globalXpid]) : $scope.tabs[0].lower;
      $scope.toggleObject = localStorage['CallsRecordings_toggleObject_of_' + $scope.globalXpid] ? JSON.parse(localStorage['CallsRecordings_toggleObject_of_' + $scope.$scope.globalXpid]) : {item: 0}; 
  });

  $scope.selected = localStorage['CallsRecordings_tabs_of_' + $scope.globalXpid] ? JSON.parse(localStorage['CallsRecordings_tabs_of_' + $scope.globalXpid]) : $scope.tabs[0].lower;
  $scope.toggleObject = localStorage['CallsRecordings_toggleObject_of_' + $scope.globalXpid] ? JSON.parse(localStorage['CallsRecordings_toggleObject_of_' + $scope.globalXpid]) : {item: 0};
  
    $scope.saveCRTab = function(tab, index){
        switch(tab){
            case "calllog":
                $scope.selected = $scope.tabs[0].lower;
                localStorage['CallsRecordings_tabs_of_' + $scope.globalXpid] = JSON.stringify($scope.selected);
                $scope.toggleObject = {item: index};
                localStorage['CallsRecordings_toggleObject_of_' + $scope.globalXpid] = JSON.stringify($scope.toggleObject);
                break;
            case "voicemails":
                $scope.selected = $scope.tabs[1].lower;
                localStorage['CallsRecordings_tabs_of_' + $scope.globalXpid] = JSON.stringify($scope.selected);
                $scope.toggleObject = {item: index};
                localStorage['CallsRecordings_toggleObject_of_' + $scope.globalXpid] = JSON.stringify($scope.toggleObject);
                break;
            case "recordings":
                $scope.selected = $scope.tabs[2].lower;
                localStorage['CallsRecordings_tabs_of_' + $scope.globalXpid] = JSON.stringify($scope.selected);
                $scope.toggleObject = {item: index};
                localStorage['CallsRecordings_toggleObject_of_' + $scope.globalXpid] = JSON.stringify($scope.toggleObject);
                break;
        }
    }; 

}]);