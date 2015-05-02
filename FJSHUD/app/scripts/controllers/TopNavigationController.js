hudweb.controller('TopNavigationController', ['$rootScope', '$scope', '$sce', 'QueueService', 'HttpService', 'ContactService', 'SettingsService', function($rootScope, $scope, $sce, queueService, httpService, contactService, settingsService) {
	var addedPid;
  var localPid;
  $scope.meModel = {};

	$scope.player = {
		position: 0,
		duration: 0,
		loaded: false,
		playing: false,
		volume: 0.6,
		progress: 0
	};

  $scope.appIcons;


  // STEP-B
  var setVerbage = function(){
    if ($scope.updatedNavbar != $scope.appIcons){
      $scope.appIcons = $scope.updatedNavbar;
      for(i in $scope.appIcons){
        var key = $scope.appIcons[i].key;

        switch(key){
          case 'Me':
            $scope.appIcons[i].title = $scope.verbage.me;
            break;
          case 'CallLog':
            $scope.appIcons[i].title = $scope.verbage.call_and_recordings;
            break;
          case 'Conferences':
            $scope.appIcons[i].title = $scope.verbage.conferencing;
            break;
          case 'CallCenter':
            $scope.appIcons[i].title = $scope.verbage.callcenter;
            break;
          case 'Search':
            $scope.appIcons[i].title = $scope.verbage.search;
            break;
          case 'Zoom':
            $scope.appIcons[i].title = $scope.verbage.zoom;
            break;
          case 'Box':
            $scope.appIcons[i].title = $scope.verbage.box;
            break;
        }

      }
    }
  };

  $scope.$on('pidAdded', function(event, data){
    addedPid = data.info;
    var ccPermissionFlag = false;
    var vidPermissionFlag = false;
    // if no saved navbar order for this user
    if (localStorage['navbar_of_' + addedPid] === undefined){
      // use default order
      settingsService.getPermissions().then(function(data) {
        // console.log('scc - ', data);
        if (data.showCallCenter && !data.showVideoCollab){
          ccPermissionFlag = true;
          localStorage['ccPerm_of_' + addedPid] = JSON.stringify(ccPermissionFlag);
          $scope.appIcons = $scope.updatedNavbar = 
           [
            {title:$scope.verbage.me, url:"#/settings", key:"Me", locked: true}
            , {title:$scope.verbage.call_and_recordings, url:"#/calllog", key:"CallLog", locked: false}
            , {title:$scope.verbage.conferencing, url:"#/conferences", key:"Conferences", locked: false}
            , {title:$scope.verbage.callcenter, url:"#/callcenter", key:"CallCenter", locked: false}
            , {title:$scope.verbage.search, url:"#/search", key:"Search", locked: false}
            , {title:$scope.verbage.box, url:"#/box", key:"Box", locked: false}
          ];
          localStorage['navbar_of_' + addedPid] = JSON.stringify($scope.appIcons);
        } else if (!data.showCallCenter && !data.showVideoCollab){
          $scope.appIcons = $scope.updatedNavbar = [
                {title:$scope.verbage.me, url:"#/settings", key:"Me", locked: true}
                , {title:$scope.verbage.call_and_recordings, url:"#/calllog", key:"CallLog", locked: false}
                , {title:$scope.verbage.conferencing, url:"#/conferences", key:"Conferences", locked: false}
                , {title:$scope.verbage.search, url:"#/search", key:"Search", locked: false}
                , {title:$scope.verbage.box, url:"#/box", key:"Box", locked: false}
              ];
          localStorage['navbar_of_' + addedPid] = JSON.stringify($scope.appIcons);
        } else if (data.showCallCenter && data.showVideoCollab){
          ccPermissionFlag = true;
          localStorage['ccPerm_of_' + addedPid] = JSON.stringify(ccPermissionFlag);
          vidPermissionFlag = true;
          localStorage['vidPerm_of_' + addedPid] = JSON.stringify(vidPermissionFlag);
          $scope.appIcons = $scope.updatedNavbar = [
                    {title:$scope.verbage.me, url:"#/settings", key:"Me", locked: true}
                    , {title:$scope.verbage.call_and_recordings, url:"#/calllog", key:"CallLog", locked: false}
                    , {title:$scope.verbage.conferencing, url:"#/conferences", key:"Conferences", locked: false}
                    , {title:$scope.verbage.callcenter, url:"#/callcenter", key:"CallCenter", locked: false}
                    , {title:$scope.verbage.search, url:"#/search", key:"Search", locked: false}
                    , {title:$scope.verbage.zoom, url:"#/zoom", key:"Zoom", locked: false}
                    , {title:$scope.verbage.box, url:"#/box", key:"Box", locked: false}
                  ];
          localStorage['navbar_of_' + addedPid] = JSON.stringify($scope.appIcons);
        } else if (!data.showCallCenter && data.showVideoCollab){
          vidPermissionFlag = true;
          localStorage['vidPerm_of_' + addedPid] = JSON.stringify(vidPermissionFlag);
          $scope.appIcons = $scope.updatedNavbar = [
                    {title:$scope.verbage.me, url:"#/settings", key:"Me", locked: true}
                    , {title:$scope.verbage.call_and_recordings, url:"#/calllog", key:"CallLog", locked: false}
                    , {title:$scope.verbage.conferencing, url:"#/conferences", key:"Conferences", locked: false}
                    , {title:$scope.verbage.search, url:"#/search", key:"Search", locked: false}
                    , {title:$scope.verbage.zoom, url:"#/zoom", key:"Zoom", locked: false}
                    , {title:$scope.verbage.box, url:"#/box", key:"Box", locked: false}
                  ];
          localStorage['navbar_of_' + addedPid] = JSON.stringify($scope.appIcons);
        }
      });
    } else {
      // load user's saved navbar order
      ccPermissionFlag = JSON.stringify(localStorage['ccPerm_of_' + addedPid]);
      vidPermissionFlag = JSON.stringify(localStorage['vidPerm_of_' + addedPid]);
      var loadedNavbarOrder = JSON.parse(localStorage['navbar_of_' + addedPid]);
      var callFlag = false;
      var videoFlag = false;
      var callIdx;
      var videoIdx;
      // find out if CC/zoom was enabled in yesterday's snapshot, if so -> set flag and save idx
      for (var i = 0, len = loadedNavbarOrder.length; i < len; i++){
        var singleIcon = loadedNavbarOrder[i];
        // search for call center
        if (singleIcon.key == 'CallCenter')
          callIdx = i;
        // search for video
        if (singleIcon.key == 'Zoom')
          videoIdx = i;
      }
      // if callCenter did not exist yesterday (no CC-permissions yesterday)...
      if (!ccPermissionFlag){
        // check if CC perm was granted last nite...
        settingsService.getPermissions().then(function(data){
          // if no CC granted last nite... aka no permission right now
          if (!data.showCallCenter){
            // just use yesterday's snapshot as is
            $scope.updatedNavbar = loadedNavbarOrder;
            setVerbage();
            // otherwise if CC permissions were granted last nite... (no CC yesterday + permission yes rt now)
          } else if (data.showCallCenter){
            // re-create CC icon at end of array (array.length)
            var endOfArray = loadedNavbarOrder.length;
            loadedNavbarOrder.splice(endOfArray, 0, {title:$scope.verbage.callcenter, url:"#/callcenter", key:"CallCenter", locked: false});
            $scope.updatedNavbar = loadedNavbarOrder;
            setVerbage();
          }
        });
        // else CC did exist yesterday (had CC-permissions yesterday)
      } else if (ccPermissionFlag){
        // check to see if CC permissions were revoked
        settingsService.getPermissions().then(function(data){
          // if revoked...
          if (!data.showCallCenter){
            // delete CC icon
            loadedNavbarOrder.splice(callIdx, 1);
            $scope.updatedNavbar = loadedNavbarOrder;
            setVerbage();
          } else if (data.showCallCenter){
            // loop thru loadednavbarorder here to remove duplicates
            $scope.updatedNavbar = loadedNavbarOrder;
            setVerbage();
          }
        });
      }
      if (!vidPermissionFlag){
        settingsService.getPermissions().then(function(data){
          if (!data.showVideoCollab){
            $scope.updatedNavbar = loadedNavbarOrder;
            setVerbage();
          } else if (data.showVideoCollab){
            var endOfArray = loadedNavbarOrder.length;
            loadedNavbarOrder.splice(endOfArray, 0, {title:$scope.verbage.zoom, url:"#/zoom", key:"Zoom", locked: false});
            $scope.updatedNavbar = loadedNavbarOrder;
            setVerbage();
          }
        });
      } else if (vidPermissionFlag){
        settingsService.getPermissions().then(function(data){
          if (!data.showVideoCollab){
            loadedNavbarOrder.splice(videoIdx, 1);
            setVerbage();
          } else if (data.showVideoCollab){
            $scope.updatedNavbar = loadedNavbarOrder;
            setVerbage();
          }
        });
      }
    }
  });

  $scope.sortableOptions = {
    placeholder: "ui-state-highlight",
    forcePlaceholderSize: true,
    cursor: "move",
    cursorAt: { top: 0, left: 50 },
    'ui-floating': true,
    stop: function(e, ui){
      // save changed-order to localStorage
      var localPid = JSON.parse(localStorage.me);
      localStorage['navbar_of_' + localPid] = JSON.stringify($scope.appIcons);
    },
    items: "a:not(.not-sortable)"
  };

  var player; // html element


  $scope.$on('me_synced', function(event,data){
      if(data){
          for(var i = 0, len = data.length; i < len; i++){
              $scope.meModel[data[i].propertyKey] = data[i].propertyValue;
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
    $scope.player.position = 0;
    $scope.player.progress = 0;
    
    // update hidden audio element
    var source = document.getElementById('voicemail_player_source');
    var path = data.voicemailMessageKey ? 'vm_download?id=' + data.voicemailMessageKey : 'media?key=callrecording:' + data.xpid;
    source.src = $sce.trustAsResourceUrl(httpService.get_audio(path));
    
    player = document.getElementById('voicemail_player');
    player.load();
    
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