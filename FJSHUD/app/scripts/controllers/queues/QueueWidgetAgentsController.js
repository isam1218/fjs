hudweb.controller('QueueWidgetAgentsController', ['$scope', '$rootScope', 'ContactService', 'QueueService', 'HttpService', 'SettingsService', 'PhoneService', '$timeout', function ($scope, $rootScope, contactService, queueService, httpService, settingsService, phoneService, $timeout) {
  var addedPid;
  $scope.que = {};
  $scope.que.query = '';
  $scope.query = "";
  $scope.selectedSort = "displayName";
  $scope.agents = [];
  $scope.myself = $rootScope.myPid;
  var queueId = $scope.$parent.$parent.queueId;

  httpService.getFeed('settings');

  $scope.$on('settings_updated', function(event, data){
      if (data['hudmw_searchautoclear'] == ''){
          autoClearOn = false;
          if (autoClearOn && $scope.que.query != ''){
                  $scope.autoClearTime = data['hudmw_searchautocleardelay'];
                  $scope.clearSearch($scope.autoClearTime);          
              } else if (autoClearOn){
                  $scope.autoClearTime = data['hudmw_searchautocleardelay'];
              } else if (!autoClearOn){
                  $scope.autoClearTime = undefined;
              }
      }
      else if (data['hudmw_searchautoclear'] == 'true'){
          autoClearOn = true;
          if (autoClearOn && $scope.que.query != ''){
              $scope.autoClearTime = data['hudmw_searchautocleardelay'];
              $scope.clearSearch($scope.autoClearTime);          
          } else if (autoClearOn){
              $scope.autoClearTime = data['hudmw_searchautocleardelay'];
          } else if (!autoClearOn){
              $scope.autoClearTime = undefined;
          }
      }        
  });

  var currentTimer = 0;

  $scope.clearSearch = function(autoClearTime){
      if (autoClearTime){
          var timeParsed = parseInt(autoClearTime + '000');
          $timeout.cancel(currentTimer);
          currentTimer = $timeout(function(){
              $scope.que.query = '';
          }, timeParsed);         
      } else if (!autoClearTime){
          return;
      }
  };

  $scope.$on('pidAdded', function(event, data){
    addedPid = data.info;
    if (localStorage['recents_of_' + addedPid] === undefined){
      localStorage['recents_of_' + addedPid] = '{}';
    }
    $scope.recent = JSON.parse(localStorage['recents_of_' + addedPid]);
  });

  $scope.storeRecentQueueMember = function(xpid){
    var localPid = JSON.parse(localStorage.me);
    $scope.recent = JSON.parse(localStorage['recents_of_' + localPid]);
    $scope.recent[xpid] = {
      type: 'contact',
      time: new Date().getTime()
    };
    localStorage['recents_of_' + localPid] = JSON.stringify($scope.recent);
    $rootScope.$broadcast('recentAdded', {id: xpid, type: 'contact', time: new Date().getTime()});
  };
  
  $scope.statusFilter = function(status){
  return function(agent) {
    if (status == 'in') {
      if (agent.status && agent.status.status.indexOf('login') != -1)
        return true;
    }
    else {
      if (agent.status && agent.status.status.indexOf('login') == -1)
        return true;
    }
  };
  };

  queueService.getQueues().then(function() {  
     $scope.agents = $scope.queue.members;
  });
  
  // refresh list
  $scope.$on('queue_members_status_synced', function() {
     $scope.agents = $scope.queue.members;
  });

  $scope.searchFilter = function(){
    var query = $scope.que.query.toLowerCase();
    return function(member){
      if (query == '' || member.displayName.toLowerCase().indexOf(query) != -1 || member.fullProfile.primaryExtension.indexOf(query) != -1)
        return true;
    };
  };

  $scope.callExtension = function($event, extension) {
    $event.stopPropagation();
    $event.preventDefault();
    
    phoneService.makeCall(extension);
  };
  
  $scope.showCallStatus = function($event, contact) {
    $event.stopPropagation();
        $event.preventDefault();
    
    // permission?
    if (contact.call.type == 0 || contact.call.contactId == $rootScope.myPid)
      return;
  
    $scope.showOverlay(true, 'CallStatusOverlay', contact);
  };

  $scope.getRef = function(member, myself){
    if (member.contactId == myself)
      return '#/queue/' + queueId;
    else
      return '#/contact/' + member.contactId;
  };

  $scope.$on("$destroy", function () {

  });

}]);
