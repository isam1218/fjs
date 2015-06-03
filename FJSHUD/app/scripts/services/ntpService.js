hudweb.service('NtpService', ['$rootScope' , function ($rootScope) { 

  this.calibrateTime = function(dateToAdjust){
    if ($rootScope.timeSyncFirstPlace == 'client'){
      // add delta to time to bring client time back in line w/ server time
      return dateToAdjust + $rootScope.timeSyncDelta;
    } else if ($rootScope.timeSyncFirstPlace == 'server'){
      // server is ahead of client --> subtract delta from client time to get client to catch up
      return dateToAdjust - $rootScope.timeSyncDelta;
    } else if ($rootScope.timeSyncFirstPlace == 'same'){
      return dateToAdjust;
    }
  };

}]);