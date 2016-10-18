hudweb.controller('MeWidgetController', ['$scope', '$rootScope', '$http', 'HttpService','PhoneService','$routeParams','ContactService','$filter','$timeout','SettingsService', 'StorageService', 'ConferenceService', 'QueueService', 'GroupService',
    function($scope, $rootScope, $http, myHttpService,phoneService,$routeParam,contactService,$filter,$timeout,settingsService, storageService, conferenceService, queueService, groupService) {
    var context = this;
    var MAX_AUTO_AWAY_TIMEOUT = 2147483647;
    var soundManager;
    var settings = {};
    var queues = [];
    var callId = $routeParam.callId;
    $scope.phoneType = false;
    var queueThresholdUpdateTimeout;
    var weblauncherTimeout;
    var timer;
    var text;
    $scope.sortType = "Date";
    $scope.avatar ={};
    $scope.phoneType = false;
    $scope.settings = {};
    $scope.currentDevices = {};
	// listens for route param to populate current call object
	$scope.$on('$routeChangeSuccess', function() {
		$scope.currentCall = phoneService.getCallDetail(callId);

        if ($scope.currentCall) {
        	$scope.onCall = true;

			// attach full profile
			if ($scope.currentCall.contactId)
				$scope.currentCall.fullProfile = contactService.getContact($scope.currentCall.contactId);
			else if ($scope.currentCall.details.conferenceId)
				$scope.currentCall.fullProfile = conferenceService.getConference($scope.currentCall.details.conferenceId);						
        }
        else {
            $scope.call_obj.phoneNumber = "";
            $scope.onCall = false;
        }       
	});

    $scope.timeElapsed = "00:00";

    $scope.getCurrentLocationTitle = function() {
        /**
         * @type {{name:string. phone:string}}
         */
        var currentLocation;
        if($scope.meModel["current_location"] && $scope.locations[$scope.meModel["current_location"]]) {
             currentLocation = $scope.locations[$scope.meModel["current_location"]];

             if($scope.meModel["current_location"])
             {
            	if(!$scope.settings)
            		$scope.settings = {};
         		$scope.settings["current_location"] = currentLocation;
             }

             if(currentLocation.locationType != 'a' && currentLocation.locationType != 'w' && currentLocation.locationType != 'm')
            	 return currentLocation.shortName+" ("+currentLocation.phone+")";
             else
            	 return currentLocation.shortName;
         }
         else {
        	 if($scope.settings && $scope.settings["current_location"])
        	    {
             	return $scope.setCurrentLocation($scope.settings["current_location"]);
        	 }
        	 else
              return "Loading...";
         }

    };

    $scope.setCurrentLocation = function(location){
    	var current_location = location;

        if(current_location.locationType != 'a' && current_location.locationType != 'w')
       	 return current_location.shortName+" ("+current_location.phone+")";
        else
       	 return current_location.shortName;
    };

    var Months = ['January','February','March','April','May','June','July','August','October','September','November','December'];
    var Weekday = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

    $scope.pbxtraVersion;
    $scope.hudserverVersion;
    $scope.fdpVersion;
    $scope.locations = {};
    $scope.call_obj = {};
    $scope.call_obj.phoneNumber = "";
    $scope.calls = {};
    $scope.onCall = false;


    settingsService.getSettings().then(function(data) {
		// grab settings from service (prevents conflict with dock)
		$scope.settings = settings = data;

		// localstorage logic
        $scope.globalXpid = $rootScope.myPid;
        $scope.language = $rootScope.language || 'us';
    });

    $scope.truncateLongString = function()
    {
    	return function(opt){
    		var truncated_name = opt.name;
    		var opt_name = opt.name;

    		if(opt.name.length > 20)
    			truncated_name = opt.name.substring(0, 19) + '...';
		    if(truncated_name == $scope.currentWebLauncher.name || opt_name == $scope.currentWebLauncher.name)
		    	opt.name =  truncated_name;
		    else
		    	opt.name = opt.orig_name;
		    return opt;
    	};
    };

    $scope.trancateSelectedName = function(){
    	if($scope.currentWebLauncher.name.length > 20)
    	{
    		$scope.currentWebLauncher.name = $scope.currentWebLauncher.name.substring(0, 19) + '...';
    	}
    };

    $scope.recentCallToFunction = function(calllog){
        if (calllog.incoming)
            return calllog.incoming;
        else {
            $scope.makeCall(calllog.phone);
        }
    };

	// only poll worker on subsequent page loads
	if (!$rootScope.isFirstSync) {
		myHttpService.getFeed('me');
		myHttpService.getFeed('queues');
		myHttpService.getFeed('locations');
		myHttpService.getFeed('calllog');
		myHttpService.getFeed('calls');
		myHttpService.getFeed('calldetails');
		myHttpService.getFeed('weblauncher');
		myHttpService.getFeed('weblaunchervariables');
		myHttpService.getFeed('i18n_langs');
	}

    /**
     * @type {{chat_status:{}, chat_custom_status:{}}}
     */
     /*

    May need to move the settings into its own seperate controller
     */
    $scope.chatStatuses = [{"title":$scope.verbage.available, "key":"available"}, {"title":$scope.verbage.away, "key":"away"}, {"title":$scope.verbage.busy, "key":"dnd"}];

    $scope.setChatStatus = function(status){
		$scope.meModel.chat_status = status;

        myHttpService.sendAction("me", "setXmppStatus", {
			"xmppStatus": status,
			"customMessage": document.getElementById('CustomStatusText').value
		});
    };

    $scope.setCustomStatus = function() {
		// get value from dom to preserve html entities
        myHttpService.sendAction("me", "setXmppStatus", {
			"xmppStatus": $scope.meModel.chat_status,
			"customMessage": document.getElementById('CustomStatusText').value
		});
    };

    this.getElementOffset = function(element) {
        if(element != undefined)
        {
            var box = null;
            try {
                box = element.getBoundingClientRect();
            }
            catch(e) {
                box = {top : 0, left: 0, right: 0, bottom: 0};
            }
            var body = document.body;
            var docElem = document.documentElement;
            var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;
            var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
            var clientLeft = docElem.clientLeft || body.clientLeft || 0;
            var clientTop = docElem.clientTop || body.clientTop || 0;

            var left = box.left + scrollLeft - clientLeft;
            var top = box.top +  scrollTop - clientTop;
            return {x:left, y:top};
        }
    };

    this.getEventHandlerElement = function(target, event) {
      if(target.getAttribute("data-ng-"+event.type)) {
          return target;
      }
      else if(target.parentNode) {
          return this.getEventHandlerElement(target.parentNode, event);
      }
    };

    $scope.showLocationsPopup = function(e,element,transfer) {
        e.stopPropagation();
        var eventTarget = context.getEventHandlerElement(e.target, e);
        var offset = context.getElementOffset(eventTarget);

        data = {key:"LocationsPopup", x:offset.x-60, y:offset.y,model:{
        	callTransfer:transfer
        }};
        $scope.showPopup(data, eventTarget);
        return false;
    };

    $scope.showBargePopup = function(e) {
        e.stopPropagation();

        var rect = e.currentTarget.getBoundingClientRect();
        var data = {
			key:"BargeDropDown",
			x:rect.left,
			y:rect.top + 25,
			model:$scope.currentCall
		};

        $scope.showPopup(data);
        return false;
    };

    $scope.showDialPad = function(e) {
        e.stopPropagation();
        var eventTarget = context.getEventHandlerElement(e.target, e);
        var offset = context.getElementOffset(eventTarget);
        $scope.showPopup({key:"DialPadPopup", x:offset.x-60, y:offset.y + 25});
        ga('send', 'event', {eventCategory:'Calls', eventAction:'Place', eventLabel: 'From Dialpad/Center'});
        return true;
    };


    $scope.calllogs = [];
    $scope.isAscending = false;
    $scope.$on('calllog_synced',function(event,data){
        if(data){
            $scope.calllogs = data.filter(function(item){
                if(item.xef001type != "delete" && !item.filterId){
                    //we attach the from display and to display values in order to sort the values
                    item.fromDisplayValue = $scope.formatIncoming(item,'From');
                    item.toDisplayValue = $scope.formatIncoming(item,'To');
                    return true;
                }
            });
            $scope.calllogs.sort(function(a,b){
                return b.startedAt - a.startedAt;
            });
        }
    });

    $scope.sortRecentCalls = function(field){
        $scope.isAscending = !$scope.isAscending;
        localStorage['MeWidget_RecentCalls_recentSelectSort_of_' + $rootScope.myPid] = JSON.stringify(field);
        localStorage['MeWidget_RecentCalls_isAscending_of_' + $rootScope.myPid] = JSON.stringify($scope.isAscending);
        switch(field){
            case 'Date':
                $scope.recentSelectSort = 'Date';
                break;
            case 'From':
                $scope.recentSelectSort = 'From';
                break;
            case 'To':
                $scope.recentSelectSort = 'To';
                break;
            case 'Duration':
                $scope.recentSelectSort = 'Duration';
                break;
        }
    };

    $scope.transferComponent;
    $scope.transferIconEnabled = false;
    $scope.transferContacts = [];
    $scope.transferFrom;
    $scope.transfer = {};
    $scope.transfer.search = '';
    $scope.transferType;
    $scope.transferToDisplayName = {};
    $scope.showResult = false;
    $scope.transferOpened = false;

    $scope.showTransferComponent = function(){
        $scope.transferComponent = true;
        $scope.transferOpened = true;
        // populate transferrable contacts
        contactService.getContacts().then(function(data){
            // transferFrom is the person I'm currently talking to...
            if ($scope.currentCall){
                $scope.transferFrom = $scope.currentCall.fullProfile ? $scope.currentCall.fullProfile : $scope.currentCall;
            }
            for (var i = 0, len = data.length; i < len; i++) {
                // must have valid phone #
                if (data[i].xpid != $rootScope.myPid && (data[i].primaryExtension || data[i].phoneMobile)) {
                    if ($scope.transferFrom){
                        if (data[i].xpid != $scope.transferFrom.xpid){
                            // filter out contacts from transfer list if do not have [transfer to primary extension permission] AND [transfer to VM permission]
                            if (settingsService.isEnabled(data[i].permissions, 4) || settingsService.isEnabled(data[i].permissions, 5)) {
                                $scope.transferContacts.push(data[i]);
                            }
                        }
                    }
                }
            }
        });
        if($scope.volume.micVolume == 0){
            $scope.update_settings('hudmw_webphone_mic','update',$rootScope.volume.mic);
        }
        
        var personBeingTransferred = $scope.currentCall.fullProfile ? $scope.currentCall.fullProfile : $scope.currentCall;
        
        /* Reference (DO NOT DELETE)
        *CP Group Permission: HUD -- Transfer call to others' extensions
        *if A is on call w/ B, and want to know if A can transfer B to C's primary extension, check the [transfer call to others' extensions permission] on B 
        *using this permission as the basis for both cold and warm transfers*/
        $scope.canTransferToOthers = settingsService.isEnabled(personBeingTransferred.permissions, 4);
        
        /* Reference (DO NOT DELETE)
        *CP Group Permission: HUD -- Transfer call to VM
        *if A is on call w/ B, and want to know if A can transfer B to C's VM --> check the transferToVM permission on B. */
        $scope.canTransferToVoicemail = settingsService.isEnabled(personBeingTransferred.permissions, 5);
    };

    $scope.transferFilter = function(){
        var query = $scope.transfer.search.toLowerCase();
        return function(contact){
            if (query == '' || contact.displayName.toLowerCase().indexOf(query) != -1 || contact.primaryExtension.indexOf(query) != -1){
                return true;
            }
        };
    };

    // called if user presses enter on keyboard after typing in 7 digits -> automatically coldTransfers
    $scope.inputtedSearch = function(){
        // numbers
        if (!isNaN($scope.transfer.search) && $scope.transfer.search.length >= 10){
            $scope.transferType = 'external';
            $scope.transferTo = {};
            $scope.transferTo.contactNumber = $scope.transfer.search;
            $scope.coldTransfer();
        }
    };

    $scope.coldTransferButtonEnabled = false;
    $scope.warmTransferButtonEnabled = false;
    $scope.toVMButtonEnabled = false;
    $scope.changeWarmButton = false;

    // called if user clicks on one of the selections
    $scope.selectTransferContact = function(selectionInput){
        $scope.transferFrom = $scope.currentCall.fullProfile ? $scope.currentCall.fullProfile : $scope.currentCall;
        $scope.selectedTransferToContact = selectionInput;
        $scope.showResult = true;
        $scope.coldTransferButtonEnabled = true;
        if (selectionInput.primaryExtension){
            $scope.transferType = 'internal';
            $scope.warmTransferButtonEnabled = true;
            $scope.toVMButtonEnabled = true;
        }
        else{
            $scope.transferType = 'external';
            // need to set $scope.transferTo in case dragging an external contact to transfer component
            $scope.transferTo = selectionInput;
            // set these to false so that not all icons are activated for external contact
            $scope.warmTransferButtonEnabled = false;
            $scope.toVMButtonEnabled = false;
        }
        angular.extend($scope.transferToDisplayName, $scope.selectedTransferToContact)
    };

    // if user clicks on already-selected name -> this brings user back 1 screen to list of possible contacts to transfer to
    $scope.showResultFalse = function(){
        $scope.showResult = false;
        $scope.coldTransferButtonEnabled = false;
        $scope.warmTransferButtonEnabled = false;
        $scope.changeWarmButton = false;
        $scope.toVMButtonEnabled = false;
        $scope.selectedTransferToContact = {};
        $scope.transferToDisplayName = {};
    };

    // used to determine whether to enable cold transfer button
    $scope.enableColdTransfer = function(){
        var nonHypenNumber = phoneService.parseOutHyphens($scope.transfer.search);
        if ($scope.coldTransferButtonEnabled)
            return true;
        else if ( (!isNaN(nonHypenNumber)) && nonHypenNumber.length >= 10)
            return true;
        else if ( (!isNaN($scope.transfer.search)) && $scope.transfer.search.length >= 10)
            return true;
        else if ($scope.transferType == 'external')
            return true;
        else
            return false;
    };

    // cold transfer functionality
    $scope.coldTransfer = function(){
        var action;
        var feed = 'mycalls';
        var params = {};
        var nonHypenNumber = phoneService.parseOutHyphens($scope.transfer.search);
        params.mycallId = $scope.currentCall.xpid;
        // receiver can be external, inputted extension, inputted phone number, etc.
        if ($scope.transferType == 'external')
            params.toNumber = $scope.transferTo.contactNumber ? $scope.transferTo.contactNumber : $scope.transferTo.phoneMobile ? $scope.transferTo.phoneMobile : $scope.transferTo.phoneBusiness;
        else if ((!isNaN(nonHypenNumber) && $scope.transfer.search.length >= 10))
            params.toNumber = nonHypenNumber;
        else
            params.toContactId = $scope.selectedTransferToContact.xpid;

        // feed action
        if ($scope.transferType == 'external' || (!isNaN(nonHypenNumber) && $scope.transfer.search.length > 4))
            action = 'transferTo';
        else if ($scope.selectedTransferToContact.primaryExtension == '')
            action = 'transferToMobile';
        else
            action = 'transferToContact';

        myHttpService.sendAction(feed, action, params);
        $scope.showResult = false;
        $scope.transfer.search = '';
        $scope.transferComponent = false;
        $scope.coldTransferButtonEnabled = false;
    };

    var warmTransferFrom;
    var warmTransferTo;
    var call1;
    $scope.call2;
    $scope.warmTransferToConnected;
    $rootScope.secondCall = false;

    // used to advance to 2nd warm transfer screen (places call #1 on hold then places call #2 to wt-recipient)
    $scope.goToWarmTransfer = function(){

        var firstCallIsWithExternal = false;
        $scope.warmTransferToConnected = false;
        // ^ to keep the 'Complete Transfer' button disabled until wt-recipient answers
        $rootScope.secondCall = true;
        // ^ so that the leftbar controller doesn't automatically reload the mewidget controller for the 2nd call (which causes the transfer component to disappear and the recent calls section to reappear)
        if ($scope.currentCall.fullProfile){
            // if call1 is with internal contact
            warmTransferFrom = $scope.currentCall.fullProfile;
        } else {
            // else if call1 is with external #
            warmTransferFrom = $scope.currentCall;
            firstCallIsWithExternal = true;
        }
        warmTransferTo = $scope.transferToDisplayName;
        
        // As a result of HUDF-1339, placing a call on hold is done automatically as soon as a 2nd call is made, so don't need to do it manually here anymore.

        // place call #2 to wt-recipient
        phoneService.makeCall($scope.transferToDisplayName.primaryExtension);
        // grab callIds for both calls
        $scope.$on("mycalls_synced",function(event,data){
            for (var i = 0; i < data.length; i++){
                if (data[i].xef001type != "delete"){
                    if (firstCallIsWithExternal){
                        // if call1 is w/ external caller
                        if (data[i].phone == warmTransferFrom.phone){
                            call1 = data[i];
                        } 
                    } else {
                        // call1 is w/ internal caller
                        if (data[i].contactId == warmTransferFrom.xpid){
                            call1 = data[i];
                        } 
                    }
                    // set $scope.call2
                    if (data[i].contactId == warmTransferTo.xpid){
                        $scope.call2 = data[i];
                        if (data[i].state === 2){
                            $scope.warmTransferToConnected = true;
                        }
                    }
                }
            }
        });
        $scope.changeWarmButton = true;
        $scope.transferComponent = true;
        // add 3rd party (last leg of warm transfer) to warm-transfer-initiater's (User A's) recent's tab
        if ($scope.transferToDisplayName.xpid)
            storageService.saveRecent('contact', $scope.transferToDisplayName.xpid);
    };

    // finalizes warm transfer by calling new API (this would be the last action by the user to complete wt)
    $scope.completeWarmTransfer = function(){
        var action = 'warmTransfer';
        var feed = 'mycalls';
        var params = {};
        params.callId1 = call1.xpid;
        params.callId2 = $scope.call2.xpid;
        myHttpService.sendAction(feed, action, params);
        $scope.changeWarmButton = false;
        $scope.warmTransferButtonEnabled = false;
        $scope.transferComponent = false;
        $scope.warmTransferToConnected = false;
        $rootScope.secondCall = false;
    };

    // used to transfer to vm
    $scope.transferToVM = function(){
        var action = 'transferToVoicemail';
        var feed = 'mycalls';
        var params = {};
        params.mycallId = $scope.currentCall.xpid;
        params.toContactId = $scope.selectedTransferToContact.xpid;
        myHttpService.sendAction(feed, action, params);
        $scope.showResult = false;
        $scope.transfer.search = '';
        $scope.transferComponent = false;
        $scope.toVMButtonEnabled = false;
    };

    var clearTransferPanel = function(){
        $scope.showResult = false;
        $scope.transfer.search = '';
        $scope.transferComponent = false;
        $scope.transferContacts = [];
        $scope.transferType = '';
        $scope.coldTransferButtonEnabled = false;
        $scope.warmTransferButtonEnabled = false;
        $scope.toVMButtonEnabled = false;
        $scope.changeWarmButton = false;
        $rootScope.secondCall = false;
    };

    // cancel transfer link/button
    $scope.cancelTransfer = function(){
        $scope.transferOpened = false;
        // if at warm transfer screen cancel -> means we want to hang up call #2
        if ($scope.changeWarmButton || $scope.warmTransferToConnected){
            phoneService.hangUp($scope.call2.xpid);
            $scope.warmTransferToConnected = false;
        }
        clearTransferPanel();
    };

    // watching for $scope.call2 of WT to hang up so that can take call1 off of hold
    $scope.$on('mycalls_synced', function(event, data){
        for (var i = 0; i < data.length; i++){
            // look for delete flag
            if (data[i].xef001type == "delete"){
                // if $scope.call2 of a WT exists...
                if ($scope.call2){
                    // match the delete flag xpid w/ $scope.call2 xpid cuz that means $scope.call2 has disconnected and we want to unhold call1
                    if (data[i].xpid == $scope.call2.xpid){
                        // loop thru mycalls change state of call1 from hold -> unhold
                        for(var call = 0; call < data.length; call++){
                            // loop thru my remaining calls, run check for call1...
                            if (call1 && data[call]){
                                // if my call is on hold -> take off of hold & clear transfer UI
                                if(call1.xpid == data[call].xpid && data[call].state == fjs.CONFIG.CALL_STATES.CALL_HOLD){
                                    $scope.warmTransferToConnected = false;
                                    clearTransferPanel();
                                    phoneService.holdCall(data[call].xpid, false);
                                    break;
                                }
                            }
                        }
                        // reset $scope.call2
                        $scope.call2 = {};
                    }
                }
            }
        }
    });

    $scope.showCallOvery = function(screen){
		// create temp object for overlay
        var data = {
			xpid: $rootScope.myPid,
			call: $scope.currentCall,
			screen: screen,
			close: true
		};

        $scope.showOverlay(true, 'CallStatusOverlay', data);
    };
    $scope.formatIncoming = function(calllog,type){    	
        switch(type){
            case "From":
                if(calllog.incoming){
                    if (calllog.displayName){
                        return calllog.displayName;
                    } else {
                        return calllog.phone;
                    }
                }else{
                    var parsedLocation = calllog.location;
                    if (parsedLocation == "HUDweb"){
                        // calls made via webphone print out location as 'HUDWeb' -> print out 'HUD Softphone'
                        return "HUD Softphone";
                    } else if (parsedLocation.split('').length <= 6){
                        // an office extension isn't longer than 6 digits, otherwise it would be a local phone number -> print out 'Office'
                        return "Office";
                    } else {
                        // this catches everything else, mobile numbers should have a length of at least 10...
                        return "Carrier";
                    }
                }
                break;
            case "To":
                if(calllog.incoming){
                    var parsedLocation = calllog.location;
                    if (parsedLocation == "HUDweb"){
                        return "HUD Softphone";
                    } else if (parsedLocation.split('').length <= 6){
                        return "Office";
                    } else {
                        return "Carrier";
                    }
                }else{
                    if (calllog.displayName){
                        return calllog.displayName;
                    } else {
                        return calllog.phone;
                    }
                }
                break;
        }
    };

    $scope.holdCall = function(call){
    	var isHeld = (call.state != fjs.CONFIG.CALL_STATES.CALL_HOLD) ? true : false;
    	phoneService.holdCall(call.xpid, isHeld);
    };


    $scope.makeCall = function(number){
        phoneService.makeCall(number);
		storageService.saveRecentByPhone(number);
		$scope.call_obj.phoneNumber = '';
        ga('send', 'event', {eventCategory:'Calls', eventAction:'From', eventLabel: 'Center Column'});
    };


    $scope.endCall = function(call){
        phoneService.hangUp(call.xpid);
        $scope.call_obj.phoneNumber = "";
        $scope.onCall = false;
    };

     $scope.hangup = function(){

        if($scope.locations[$scope.meModel['current_location']].locationType == 'w'){
            //phoneService.hangUp();
            for(var call in $scope.calls){
                phoneService.hangUp(call);
                phoneService.removeNotification();
            }

        }else{
            myHttpService.sendAction('me','callTo',{phoneNumber: number});
        }
        $scope.call_obj.phoneNumber = "";
        $scope.onCall = false;
    };


    $scope.$on('locations_synced', function(event,data){
        if(data){
            for (var i = 0, len = data.length; i < len; i++) {
                $scope.locations[data[i].xpid] = data[i];
            }
        }
    });

    settingsService.getPermissions().then(function(data){
        $scope.canRecord = data.recordingEnabled;
    });

    $scope.recordCall = function(action) {
        var action = '';

        if (!$scope.currentCall.record) {
            $scope.recordingElapsed = '00:00';
            localStorage.recordedAt = new Date().getTime();
            action = 'startCallRecording';
        }
        else
            action = 'stopCallRecording';

        if($scope.currentCall){
        	$scope.onCall = true;
            if($scope.currentCall.contactId){
               myHttpService.sendAction('contacts', action, {contactId: $scope.currentCall.contactId});
            }else{
               if(!$scope.currentCall.record){
                    action = 'startRecord';
               }else{
                   action = 'stopRecord';
               }
               myHttpService.sendAction('mycalls', action, {mycallId: $scope.currentCall.xpid});

            }
        }
    };

    $scope.callKeyPress = function($event){
        if ($event.keyCode == 13 && !$event.shiftKey) {
            $scope.makeCall($scope.call_obj.phoneNumber);
            $scope.call_obj.phoneNumber = '';
            $event.preventDefault();
        }
    };

    $scope.parkCall = function(currentCall){
        phoneService.parkCall(currentCall.xpid);
    };


    /*
    - no longer checking the individual contact's permission for isXferFromEnabled permission, but rather checking my permission feed for isXferFromEnabled permission...
    - aka this is a personal permission, not a permission based on the other party...
    - see HUDF-727 - Mikhail's comment on 8.18.15
    */
    $scope.canTransferFrom = settingsService.getPermission('canTransferFrom');

    $scope.muteCall = function(){
       if($scope.volume.micVolume == 0){
            $scope.update_settings('hudmw_webphone_mic','update',$rootScope.volume.mic);

        }else{
            $rootScope.volume.mic = angular.copy($scope.volume.micVolume);
            $scope.update_settings('hudmw_webphone_mic','update',0);
       }
    };

    $scope.muteConference = function(){
        phoneService.mute($scope.currentCall.xpid, !$scope.currentCall.mute);
    };

    $scope.update_settings = function(type,action,model, currentObject){
        switch(type){
            case 'hudmw_webphone_mic':
                myHttpService.updateSettings(type,action,model);
                phoneService.setMicSensitivity(model);
                break;
            case 'hudmw_webphone_speaker':
                myHttpService.updateSettings(type,action,model);
                phoneService.setVolume(model);
                break;
            default:
                myHttpService.updateSettings(type,action,model);
                break;


    }

    };

     $scope.silentSpk = function(){
        if($scope.volume.spkVolume == 0){
             $scope.update_settings('hudmw_webphone_speaker','update',$rootScope.volume.spk);
        }else{
            $rootScope.volume.spk = angular.copy($scope.volume.spkVolume);
            $scope.update_settings('hudmw_webphone_speaker','update',0);
         }
     };

    var updateTime = function() {
        if ($scope.currentCall && $scope.currentCall.startedAt) {
            // format date
            var date = new Date().getTime();
            $scope.timeElapsed = $filter('date')(date - $scope.currentCall.startedAt, 'mm:ss');

            // also get recorded time
            if ($scope.currentCall.recorded)
                $scope.recordingElapsed = $filter('date')(date - localStorage.recordedAt, 'mm:ss');
            // increment
            $timeout(updateTime, 1000);

        }
    };

    $scope.$on('make_phone_call',function(event,data){
        $scope.callKeyPress(data);        
    });

    $scope.$on('calls_updated',function(event,data){
        $scope.calls = data;
        var call_exist = false;
        $scope.onCall = false;
       
        if(data && !$.isEmptyObject(data)){
            for (var i in data){
                if(data[i].xpid == $scope.meModel.my_pid){
                    $scope.calls[data[i].contactId] = data[i];
                }
                if($scope.currentCall){
                    if(data[i].sipId == $scope.currentCall.sipId){
                        $scope.currentCall = data[i];
                    }else if(data[i].phone == $scope.currentCall.phone){
                        $scope.currentCall = data[i];
                        call_exist = true;
                        $scope.onCall = true;

                    }else if(data[i].xpid == $scope.currentCall.xpid){
                        $scope.currentCall = data[i];
                    }
                    $routeParam.callId = $scope.currentCall.xpid;
                }
            }

            if($scope.calls[[callId]]){
                $scope.currentCall = $scope.calls[callId];
            }else{
                $scope.timeElapsed = "00:00";
            }

            if($scope.currentCall && !data[$scope.currentCall.xpid]){
                $scope.currentCall = null;
                $scope.onCall = false;
                $scope.call_obj.phoneNumber = "";  
            }
        }else{
            $scope.currentCall = null;
            $scope.onCall = false;  
            $scope.call_obj.phoneNumber = "";  
        }

        updateTime();
    });
   
    var dtmf_input = "";

    // this is for determining whether to show old transfer UI vs new transfer UI. If CP14 & cloud server --> show new transfer UI
    $scope.cpFourteen = false;
    $scope.serverVersionCloud = false;
    // only checking for cp14 (and fcs staging environments for dev testing) -> need to make sure to add checks for any new versions of CP that are released thereafter
    var possibleCpVersions = ["cp14"];

    $scope.$on("me_synced", function(event, data){
        for (var i = 0; i < data.length; i++){
            if (data[i].propertyKey == "cp_location"){
                var cpLocationParsed = data[i].propertyValue;
                var parseReturnsFcs = cpLocationParsed.indexOf('fcs') != -1 && cpLocationParsed.indexOf('fcs') == 0 ? true : false;
                // check for "cp14" or "fcs-stg3-cp" or "fcs-stg-cp", etc (1st three letters of cp_location propertyValue string will be 'fcs')

                for (var j = 0; j < possibleCpVersions.length; j++){
                    if (data[i].propertyValue == possibleCpVersions[j]){
                        $scope.cpFourteen = true;
                        break;
                    }
                }

                if (parseReturnsFcs)
                    $scope.cpFourteen = true;

            }
            if (data[i].propertyKey == "server_version"){
                var serverVersionSplit = data[i].propertyValue.split('.');
                var sv1 = serverVersionSplit[0];
                var sv2 = serverVersionSplit[1];
                var sv3 = serverVersionSplit[2];
                var sv4 = serverVersionSplit[3]
                // if (<3) or (<= 3-3.5) or (3.5.0-3.5.1)
                if ( (parseInt(sv1) < 3) || (parseInt(sv1) === 3 && parseInt(sv2) < 5) || (parseInt(sv1) === 3 && parseInt(sv2) === 5 && parseInt(sv3) < 1) )
                    $scope.serverVersionCloud = false;
                else
                    $scope.serverVersionCloud = true;

            }
        }
    });


}]);
