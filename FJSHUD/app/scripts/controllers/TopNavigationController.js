hudweb.controller('TopNavigationController', ['$rootScope', '$scope', '$sce', '$interval', 'QueueService', 'HttpService', 'ContactService', 'SettingsService', function($rootScope, $scope, $sce, $interval, queueService, httpService, contactService, settingsService) {
  var addedPid;
  var localPid;
  var player; // html element
  var loadCheck;

	$scope.player = {
		position: 0,
		duration: 0,
		loaded: false,
		playing: false,
		volume: 0.6,
		progress: 0
	};

  $scope.appIcons;

  var enableIcon = function(addedIconKey){
    for (var i = 0; i < $scope.appIcons.length; i++){
      var currentIcon = $scope.appIcons[i];
      if (currentIcon.key === addedIconKey)
        currentIcon.enabled = 1;
    }
  };

  var disableIcon = function(iconToRemoveKey){
    for (var i = 0; i < $scope.appIcons.length; i++){
      var currentIcon = $scope.appIcons[i];
      if (currentIcon.key === iconToRemoveKey)
        currentIcon.enabled = 0;
    }
  };

  var loadNavbar = function(){
    // To INTEGRATE, add new navbar icons HERE...
    $scope.appIcons = [
        {title:"Me", url:"#/settings", key:"Me", enabled:1, title: $scope.verbage.me}
        , {title:"Calls and Recordings", url:"#/calllog", key:"CallLog", enabled:1, title: $scope.verbage.call_and_recordings}
        , {title:"Conferencing", url:"#/conferences", key:"Conferences", enabled:1, title: $scope.verbage.conferencing}
        , {title:"Call Center", url:"#/callcenter", key:"CallCenter", enabled:1, title: $scope.verbage.callcenter}
        , {title:"Search", url:"#/search", key:"Search", enabled:1, title: $scope.verbage.search}
        , {title:"Box", url:"#/box", key:"Box", enabled:1, title: $scope.verbage.box}
        , {title:"Video Collaboration", url:"#/zoom", key:"Zoom", enabled:1, title: $scope.verbage.zoom}
        // ***Intellinote integration here***
    ];
    // take into account licenses (disable icon if user does not have license)...
    settingsService.getPermissions().then(function(data) {
      if (!data.showVideoCollab)
        disableIcon("Zoom");
      if (!data.showCallCenter)
        disableIcon("CallCenter");
    });
  }();

  $scope.$on('settings_updated', function(event, data){
    if (data['hudmw_box_enabled'])
      enableIcon('Box');
    else
      disableIcon('Box');
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
  
  /**
    VOICEMAIL PLAYER
  */
  
  $scope.$on('play_voicemail', function(event, data) {
	$interval.cancel(loadCheck);
	  
    $scope.voicemail = data.fullProfile ? data.fullProfile : contactService.getContact(data.contactId);
    $scope.player.loaded = false;
    $scope.player.duration = data.duration;
    $scope.player.position = 0;
    $scope.player.progress = 0;
    
    // update hidden audio element
    var source = document.getElementById('voicemail_player_source');
    var path = data.voicemailMessageKey ? 'vm_download?id=' + data.voicemailMessageKey : 'media?key=callrecording:' + data.xpid;
    source.src = $sce.trustAsResourceUrl(httpService.get_audio(path));
    
    player = document.getElementById('voicemail_player');
    player.load();
	
	// fail catch
	loadCheck = $interval(function() {
		if (isNaN(player.duration))
			player.load();
		else
			$interval.cancel(loadCheck);
	}, 1000);
    
    player.onloadeddata = function() {
      $scope.player.loaded = true;
      $scope.player.playing = true;
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

    $scope.$on("$destroy", function() {
  
    });
}]);