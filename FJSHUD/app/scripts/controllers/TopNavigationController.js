hudweb.controller('TopNavigationController', ['$rootScope', '$scope', '$sce', 'QueueService', 'HttpService', 'UtilService', 'ContactService', function($rootScope, $scope, $sce, queueService, httpService, utilService, contactService) {
  $scope.meModel = {};
  $scope.permissions = {
      Zoom: {bit:1,enabled:false}
  };

  $scope.appIcons = [
      {title:$scope.verbage.me, url:"#/settings", key:"Me",enabled:1}
      , {title:$scope.verbage.call_and_recordings, url:"#/calllog", key:"CallLog",enabled:1}
      , {title:$scope.verbage.conferencing, url:"#/conferences", key:"Conferences", enabled:1}
      , {title:$scope.verbage.callcenter, url:"#/callcenter", key:"CallCenter",enabled:1}
      , {title:$scope.verbage.search, url:"#/search", key:"Search",enabled:1}
      , {title:$scope.verbage.zoom, url:"#/zoom", key:"Zoom",enabled:1}
      , {title:$scope.verbage.box, url:"#/box", key:"Box",enabled:1}
  ];
	
	$scope.player = {
		position: 0,
		duration: 0,
		loaded: false,
		playing: false,
		volume: 0.6,
		progress: 0
	};

  $scope.updatedNavbar = localStorage.savedNavbarOrder ? JSON.parse(localStorage.savedNavbarOrder) : {};
  // console.log('LS upon initial load - ', $scope.updatedNavbar);

  if ($scope.updatedNavbar != $scope.appIcons){
    // console.log('1. nav [] - ', $scope.updatedNavbar);
    // console.log('2. app [] - ', $scope.appIcons);
    $scope.appIcons = $scope.updatedNavbar;
  }

  $scope.sortableOptions = {
    placeholder: "ui-state-highlight",
    forcePlaceholderSize: true,
    cursor: "move",
    cursorAt: { top: 0, left: 50 },
    'ui-floating': true,
    stop: function(e, ui){
      // console.log('$scope.appIcons - ', $scope.appIcons);
      // save changed-order to localStorage
      localStorage.setItem('savedNavbarOrder', JSON.stringify($scope.appIcons));      
    }
  };

  var player; // html element


  $scope.$on('me_synced', function(event,data){

      // $scope.navbarOrder = JSON.parse(localStorage.navbarOrder);

      if(data){
          for(medata in data){
              $scope.meModel[data[medata].propertyKey] = data[medata].propertyValue;
          }
      }

      var permissions = parseInt($scope.meModel.personal_permissions);
      
      for(perm in $scope.permissions){

          $scope.permissions[perm].enabled = utilService.isEnabled(
              permissions,
              $scope.permissions[perm].bit
          )

          for(app in $scope.appIcons){
              if($scope.appIcons[app].key == perm){
                  $scope.appIcons[app].enabled = 1;//$scope.permissions[perm].enabled;
              }
          }

      }

  });


	$scope.getAvatar = function() {
		return httpService.get_avatar($rootScope.myPid, 28, 28,icon_version);
	};
	
	$scope.$on('queues_updated', function(event, data) {
		$scope.queue = queueService.getMyQueues();
	});
	
	/**
		VOICEMAIL PLAYER
	*/
	
	$scope.$on('play_voicemail', function(event, data) {
		$scope.voicemail = data.fullProfile ? data.fullProfile : contactService.getContact(data.contactId);
		$scope.player.loaded = false;
		$scope.player.duration = data.duration;
		
		// update hidden audio element
		var source = document.getElementById('voicemail_player_source');
		var path = data.voicemailMessageKey ? 'vm_download?id=' + data.voicemailMessageKey : 'media?key=callrecording:' + data.xpid;
		source.src = $sce.trustAsResourceUrl(httpService.get_audio(path));
		
		player = document.getElementById('voicemail_player');
		player.load();
		
		player.onloadeddata = function() {
			$scope.player.loaded = true;
			$scope.player.playing = true;
			$scope.player.position = 0;
			$scope.$safeApply();
			
			player.play();
		};
		
		player.ontimeupdate = function() {
			$scope.player.position = player.currentTime*1000;
			
			// prevent the jitters
			if (!document.body.onmousemove)
				$scope.player.progress = (player.currentTime / player.duration * 100) + '%';
				
			$scope.$safeApply();
		};
		
		player.onpause = function() {
			$scope.player.playing = false;
			$scope.$safeApply();
			
			// kill player
			if (!$scope.voicemail)
				player = null;
		};
		
		player.onplay = function() {
			$scope.player.playing = true;
			$scope.$safeApply();
		};
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
			$scope.$safeApply();
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
		player.pause();
	};
	
	var icon_version;
    $scope.$on("fdpImage_synced",function(event,data){
        if(data){
            for(i in data){
                if(data[i].xpid == $rootScope.myPid){
                    icon_version = data[i].xef001iver;
                }
            }
        } 
    });

	$scope.logout = function() {
		httpService.logout();
	};

    $scope.$on("$destroy", function() {
	
    });
}]);