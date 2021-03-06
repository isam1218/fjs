hudweb.service('NtpService', function () { 
  var timeSyncFirstPlace;
  var timeSyncDelta;
  var clientFirstTime;
  var serverFirstTime;
  
  this.syncTime = function(data) {
	clientFirstTime = new Date().getTime();
	serverFirstTime = data;
	
	if (serverFirstTime > clientFirstTime){
	  // client time is ahead, server time behind
	  timeSyncFirstPlace = 'client'; 
	  timeSyncDelta = Math.abs(clientFirstTime - serverFirstTime);
	} else if (clientFirstTime > serverFirstTime){
	  // server time is ahead, client time behind
	  timeSyncFirstPlace = 'server';
	  timeSyncDelta = Math.abs(clientFirstTime - serverFirstTime);
	} else {
	  timeSyncFirstPlace = 'same';
	  timeSyncDelta = 0;
	}
  };

  // dateToAdjust needs to be in new Date().getTime() format aka milliseconds since 1-1-1970...
  this.calibrateTime = function(dateToAdjust){
    
    if (timeSyncFirstPlace == 'client'){
      // add delta to time to bring client time back in line w/ server time

      return dateToAdjust + timeSyncDelta;

    } else if (timeSyncFirstPlace == 'server'){
      // server is ahead of client --> subtract delta from client time to get client to catch up
      
      return dateToAdjust - timeSyncDelta;

    } else {
      return dateToAdjust;
    }
  };

  // do the opposite when sending object's timestamp to native plugin
  this.calibrateNativeTime = function(dateToAdjust){
    if (timeSyncFirstPlace == 'client')
      return dateToAdjust - timeSyncDelta;
	else if (timeSyncFirstPlace == 'server')     
      return dateToAdjust + timeSyncDelta;
	else
      return dateToAdjust;
  };

  this.getServerTime = function() {
	return serverFirstTime;  
  };
});