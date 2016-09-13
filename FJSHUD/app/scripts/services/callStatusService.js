hudweb.service('CallStatusService', ['$rootScope', 'ContactService', function($rootScope, contactService) {
  
  // service function to determine if the call status circle belongs to me - if so -> return true to block overlay
  this.blockOverlay = function(contact){
    // if the contact is mine
    if (contact.xpid == $rootScope.myPid){
      return true;
    }
    var myContact = contactService.getContact($rootScope.myPid);
    // if i'm on a call...
    if (myContact.call){
      var imTheBarger = false;
      var bargerArray = myContact.call.fullProfile.call.bargers;
      // check to see if I'm the barger of the call I'm trying to click on...
      if (bargerArray){
        for (var i = 0; i < bargerArray.length; i++){
          if (bargerArray[i].xpid == $rootScope.myPid){
            imTheBarger = true;
            break;
          }
        }
      }
      // so long as I'm not the barger...
      if (myContact.call.barge === 0 && !imTheBarger){
        // if the person i'm talking to is the contact clicked on
        if (myContact.call.contactId == contact.call.xpid){
          return true;
        }
      }
    }
  };

}]);