hudweb.controller('TopNavigationController', ['$rootScope', '$scope', 'windowDimensions', '$sce', '$interval', '$timeout', 'QueueService', 'HttpService', 'ContactService', 'SettingsService','$modal', function($rootScope, $scope, windowDimensions, $sce, $interval, $timeout, queueService, httpService, contactService, settingsService, $modal) {
  $scope.showDropdown = false;
  $scope.smallScreen = false;
  //Initialize window width 
  $scope.windowWidth  = windowDimensions.width();
  $scope.moreIcon = $('.TopBar .TopBarIcons .TopBarItemApp.more');
  //initialize the window width flag
  if($scope.windowWidth <= 1195)
	  $scope.smallScreen = true;
  else
	  $scope.smallScreen = false;
  
  //show or hide the navigation icons dropdown for small screen
  $scope.showHideiconsDropdown = function(isClicked)
  {
	  if(isClicked)
	   $scope.showDropdown ? $scope.showDropdown = false : $scope.showDropdown = true;
	  else
	   $scope.showDropdown = false;  
	  
	  if($scope.showDropdown)
		  $('#DropDownMoreList').show();
	  else
		  $('#DropDownMoreList').hide();
  };
  
  //show or hide nav icons based on browser size and display of voicemail widget
  $scope.showNavIcon = function(icon){
	  if((icon.key != 'Me' && $scope.voicemail && $scope.smallScreen) || (icon.key == 'CallCenter' && !$rootScope.showCallCenter))
		  return false;
	  
	  return true;	  		  		  		    
  };

    // To INTEGRATE, add new navbar icons HERE...
    $scope.appIcons = [
        {
			url:"#/settings", 
			key:"Me", 
			enabled:true, 
			title: $scope.verbage.me
		},
		{
			url:"#/calllog", 
			key:"CallLog", 
			enabled:true, 
			title: $scope.verbage.vm_and_recordings
		},
		{
			url:"#/conferences", 
			key:"Conferences", 
			enabled:true, 
			title: $scope.verbage.conferencing
		},
		{
			url:"#/callcenter", 
			key:"CallCenter", 
			enabled:false, 
			title: $scope.verbage.callcenter
		},
		{
			url:"#/search", 
			key:"Search", 
			enabled:true, 
			title: $scope.verbage.search
		},
		{
			url:"#/zoom", 
			key:"Zoom", 
			enabled:false, 
			title: $scope.verbage.zoom
		},
		{
			url:"#/intellinote", 
			key:"Intellinote", 
			enabled:false, 
			title: "Intellinote"
		},
		{
			url:"#/zipwhip", 
			key:"Zipwhip", 
			enabled:false, 
			title: "Zipwhip"
		},
    {
      url:"#/callanalytics",
      key:"Inphonex",
      enabled:false,
      title: "Call Analytics"
    }
    ];
	
	$scope.$on('me_synced', function() {
		settingsService.getPermissions().then(function(data) {
			for (var i = 0, iLen = $scope.appIcons.length; i < iLen; i++) {
				// toggle permission-based icons
				if ($scope.appIcons[i].key == 'Intellinote')
					$scope.appIcons[i].enabled = data.showIntellinote;
				else if ($scope.appIcons[i].key == 'Zipwhip')
					$scope.appIcons[i].enabled = data.showZipwhip;
				else if ($scope.appIcons[i].key == 'Zoom')
					$scope.appIcons[i].enabled = data.showVideoCollab;
				else if ($scope.appIcons[i].key == 'CallCenter')
					$scope.appIcons[i].enabled = data.showCallCenter;
        else if ($scope.appIcons[i].key == 'Inphonex')
          $scope.appIcons[i].enabled = data.showInphonex;
			}
		});
	});	

  $scope.openPreferences = function(){
    $modal.open({
      animation: $scope.animationsEnabled,
      templateUrl: 'views/Preferences.html',
      controller: 'PreferencesController',
      size: 'lg'
    });
  };

	$scope.checkEmail = function(key,url){
			
		if(($rootScope.meModel.email == "" || $rootScope.meModel.email == undefined) && (key === "Zoom" && key != "Box") && (url === '#/zoom' && url != '#/box')){
		
		$modal.open({
      animation: $scope.animationsEnabled,
      templateUrl: 'emailCheck.html',
      controller: 'emailCheckController',
      size: 'lg',
      resolve: {
        schedule: function () {
          return $scope.scheduleBtn;
        },
        update: function(){
          return $scope.updateBtn;
        },
        shared: function(){
          return $scope.meeting_id;
        },
        host: function(){
          return $scope.host_id;
        },
        topic: function(){
          return $scope.topic;
        },
        time: function(){
          return $scope.start_time;
        },
        timezone:function(){
          return $scope.timezone;
        },
        password:function(){
          return $scope.password;
        },
        option:function(){
          return $scope.option; 
        },
        start_hour: function(){
          return $scope.start_hour;
        },
        AmPm: function(){
          return $scope.AmPm;
        },
        hourDuration: function(){
          return $scope.hourDuration;
        },
        minDuration: function(){
          return $scope.minDuration;
        }
      }
    });

	}
	}
  
  queueService.getQueues().then(function() {
    $scope.queue = queueService.getMyQueues();
  });
  
  // refresh
  $scope.$on('queue_members_status_synced', function() {
    $scope.queue = queueService.getMyQueues();
  });

  $scope.logout = function() {
    httpService.logout();
  };
  
}]);

hudweb.controller('emailCheckController', function ($scope, $modalInstance, schedule,update,shared,host,topic,time,timezone,password,option,start_hour,AmPm,hourDuration,minDuration,$http,$rootScope,$modal,sharedData,$timeout,$route,$filter) {
  $scope.cancelEmailCheck = function () {
    $modalInstance.dismiss('cancel');
  };

  
});
