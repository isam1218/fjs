hudweb.controller('TopNavigationController', ['$rootScope', '$scope', 'windowDimensions', '$sce', '$interval', '$timeout', 'QueueService', 'HttpService', 'ContactService', 'SettingsService', function($rootScope, $scope, windowDimensions, $sce, $interval, $timeout, queueService, httpService, contactService, settingsService) {
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
	  if(icon.key != 'Me' && $scope.voicemail && $scope.smallScreen)
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
			title: $scope.verbage.call_and_recordings
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
			url:"#/box", 
			key:"Box", 
			enabled:false, 
			title: $scope.verbage.box
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
		}
    ];
	
	$scope.$on('me_synced', function() {
		settingsService.getPermissions().then(function(data) {
			for (var i = 0, iLen = $scope.appIcons.length; i < iLen; i++) {
				// toggle permission-based icons
				if ($scope.appIcons[i].key == 'Intellinote')
					$scope.appIcons[i].enabled = data.showIntellinote;
				else if ($scope.appIcons[i].key == 'Zoom')
					$scope.appIcons[i].enabled = data.showVideoCollab;
				else if ($scope.appIcons[i].key == 'CallCenter')
					$scope.appIcons[i].enabled = data.showCallCenter;
			}
		});
	});

	$scope.$on('settings_updated', function(event, data){
		for (var i = 0, iLen = $scope.appIcons.length; i < iLen; i++) {
			// toggle box icon
			if ($scope.appIcons[i].key == 'Box') {
				$scope.appIcons[i].enabled = data['hudmw_box_enabled'];
				break;
			}
		}
	});

  $scope.getAvatar = function() {
    return httpService.get_avatar($rootScope.myPid, 28, 28,icon_version);
  };
  
  queueService.getQueues().then(function() {
    $scope.queue = queueService.getMyQueues();
  });
  
  // refresh
  $scope.$on('queue_members_status_synced', function() {
    $scope.queue = queueService.getMyQueues();
  });
  
  var icon_version;

  $scope.$on("fdpImage_synced",function(event,data){
      if(data){
          for(var i = 0, len = data.length; i < len; i++){
              if(data[i].xpid == $rootScope.myPid){
                  icon_version = data[i].xef001iver;
              }
          }
      } 
  });

  $scope.logout = function() {
    httpService.logout();
  };
  
	/**
		VOICEMAIL PLAYER
	*/
  
	$scope.player = {
		position: 0,
		duration: 0,
		loaded: false,
		playing: false,
		volume: 0.6,
		progress: 0
	};
	
	$scope.recorder;
	$scope.attempts = 0;
	
	var player;
	var source;
	var retry;
	
	var loadAgain = function() {
		// retry 3x, then give up
		if ($scope.attempts < 3) {
			retry = setTimeout(function() {
				player.load();
			}, 1000);
			
			$scope.attempts++;
		}
	};
  
	$scope.$on('play_voicemail', function(event, data) {
		clearTimeout(retry);
		
		// first time setup
		if (!player) {
			player = document.getElementById('voicemail_player');
			source = document.getElementById('voicemail_player_source');
			
			player.onloadeddata = function() {
				$scope.player.loaded = true;
				$scope.player.playing = true;
				$scope.$digest();
				
				player.play();
			};
			
			player.ontimeupdate = function() {
				$scope.player.position = player.currentTime*1000;
				
				// prevent the jitters
				if (!document.body.onmousemove)
					$scope.player.progress = (player.currentTime / player.duration * 100) + '%';
				
				$scope.$digest();
			};
			
			player.onpause = function() {
				$scope.player.playing = false;
				$scope.$digest();
			};
			
			player.onplay = function() {
				$scope.player.playing = true;
				$scope.$digest();
			};
			
			// fail like a boss
			player.onerror = loadAgain;
			source.onerror = loadAgain;
		}
		else
			player.pause();
		
		// reset	
		$scope.attempts = 0;
		$scope.voicemail = null;
		$scope.player.loaded = false;
		$scope.player.duration = data.duration;
		$scope.player.position = 0;
		$scope.player.progress = 0;
		
		// is this a recording?
		if (data.originatorUserId) {
			// find other party
			if (!data.calleeUserId || data.fullProfile.xpid == data.calleeUserId)
				$scope.recorder = contactService.getContact(data.callerUserId);
			else 
				$scope.recorder = contactService.getContact(data.calleeUserId);
		}
		else {
			$scope.recorder = null;
			
			// mark as read
			httpService.sendAction("voicemailbox", "setReadStatus", {'read': true, id: data.xpid});
		}
			
		// update hidden audio element
		var path = data.voicemailMessageKey ? 'vm_download?id=' + data.voicemailMessageKey : 'media?key=callrecording:' + data.xpid;
		source.src = $sce.trustAsResourceUrl(httpService.get_audio(path));
		player.load();
	
		// delay getting profile so view will update
		$timeout(function() {
			if (data.fullProfile)
				$scope.voicemail = data.fullProfile;
			else if (data.contactId)
				$scope.voicemail = contactService.getContact(data.contactId);
			else
				$scope.voicemail = data;
		}, 10);
    
		// 'more' icon
		if ($(document).width() <= 1195) {
			$scope.smallScreen = true;  
			$($scope.moreIcon).show();
		}
		else {
			$scope.smallScreen = false;
			$($scope.moreIcon).hide();
		}
	});
  
	$scope.playAudio = function() {
		if ($scope.player.playing)
			player.pause();
		else
			player.play();
	};
	
	$scope.changeSeek = function(seek) {
		player.currentTime += seek;
	};
  
	$scope.changeVolume = function(vol) {
		$scope.player.volume += vol;
		
		// keep within range
		if ($scope.player.volume > 1)
			$scope.player.volume = 1;
		else if ($scope.player.volume < 0)
			$scope.player.volume = 0;
			
		player.volume = $scope.player.volume;
	};
  
	$scope.moveSlider = function($event) {
		var rect = $event.target.parentNode.getBoundingClientRect();
	
		document.body.onmousemove = function(e) {
			var diff = e.clientX - rect.left;
			
			// keep within range
			if (diff < 0)
			diff = 0;
			else if (diff > rect.width)
			diff = rect.width;
			
			$scope.player.progress = diff + 'px';
			$scope.$digest();
		};
	
		document.body.onmouseup = function(e) {
			// set new progress
			var diff = (e.clientX - rect.left) / rect.width;
			player.currentTime = diff * player.duration;
			
			// remove listeners
			document.body.onmousemove = null;
			document.body.onmouseup = null;
		};
	};
  
	$scope.closePlayer = function() {
		$scope.voicemail = null;
		$scope.recorder = null;
		
		clearTimeout(retry);
		
		player.pause();
		player.onloadeddata = null;
		player.ontimeupdate = null;
		player.onpause = null;
		player.onplay = null;
		player.onerror = null;
		player = null;
		
		source.onerror = null;
		source = null;
	};
}]);