hudweb.controller('CallStatusOverlayController', ['$scope', '$rootScope', '$filter', '$timeout', '$location', 'ConferenceService', 'ContactService', 'HttpService', 'NtpService', 'PhoneService', 'SettingsService', function($scope, $rootScope, $filter, $timeout, $location, conferenceService, contactService, httpService, ntpService, phoneService, settingsService) {
	$scope.onCall = $scope.$parent.overlay.data;
	
	$scope.conferences = [];
	$scope.conf = this;
	$scope.conf.query = '';
	$scope.confQuery = this;
	$scope.confQuery.query = '';
	$scope.transfer = this;
	$scope.transfer.search = '';
	$scope.selectedConf = null;
	$scope.addError = null;
	$scope.who = {};
	$scope.who.sendToPrimary = true;
	$scope.alreadyBarged = false;
	$scope.alreadyMonitored = false;
	$scope.topAlreadyWhispered = false;
	$scope.bottomAlreadyWhispered = false;
	$scope.topUserProfile;	
	$scope.transferResults;
	$scope.transferContacts = [];
	$scope.transferType;
	$scope.recentTransfers = [];
	var recentXpids;
	var externalContact;
	var firstArr = []
	var secondArr = [];
	var toClose = $scope.$parent.overlay.data.close ? true : false;
	
	if($scope.$parent.overlay.data.screen){		
		switch($scope.$parent.overlay.data.screen){
			case 'transfer':
				$scope.screen = 'transfer';
				$scope.transferFrom = contactService.getContact($scope.$parent.overlay.data.call.contactId);				
				$scope.transferTo = null;

				if(!$scope.transferFrom){
					$scope.transferFrom = $scope.onCall.call;
				}
				break;
			case 'conference':
				// this is if transferring own call to conference room...
				// sort by displaying home server conference rooms first...
				firstArr = [];
				secondArr = [];
				conferenceService.getConferences().then(function(data) {
					var myObj = contactService.getContact($rootScope.myPid);
					var myServerNumber = myObj.jid.split('_')[0];
					for (var i = 0, iLen = data.conferences.length; i < iLen; i++){
						if (myServerNumber == data.conferences[i].serverNumber.split('_')[1])
							firstArr.push(data.conferences[i]);
						else
							secondArr.push(data.conferences[i]);
					}
					firstArr = firstArr.concat(secondArr);
					$scope.conferences = firstArr;
				});
				$scope.topUserProfile = contactService.getContact($scope.onCall.xpid);
				$scope.onCall.call.fullProfile = contactService.getContact($scope.$parent.overlay.data.call.contactId);
				$scope.screen = 'conference';
				$scope.selectedConf = null;
				$scope.meToo = 0;
				break;
			default:
				$scope.screen = 'call';
				break;
		}

	}else{
		$scope.screen = 'call';
	}
	
	$scope.bargeCall = function(type, xpid) {
		httpService.sendAction('contacts', type + 'Call', {contactId: xpid});
		$scope.showOverlay(false);
	};
	
	$scope.recordCall = function() {
		var action = '';
		if (!$scope.onCall.call.recorded) {
			$scope.onCall.call.recorded = true;
			
			action = 'startCallRecording';
		}
		else{
			$scope.onCall.call.recorded = false;
			action = 'stopCallRecording';
		}
		httpService.sendAction('contacts', action, {contactId: $scope.onCall.xpid});
	};
	
	/**
		ALTERNATE POP-UP SCREENS
	*/
	
	$scope.changeScreen = function(screen, onCallObj, topOrBottom) {
		if(toClose){
			$scope.showOverlay(false);
			return;
		}

		$scope.screen = screen;
		$scope.addError = null;
		
		if (screen == 'conference') {
			// if transferring a call (that is NOT my own call) to a conference room...
			firstArr = [];
			secondArr = [];
			conferenceService.getConferences().then(function(data) {
				var myObj = contactService.getContact($rootScope.myPid);
				var myServerNumber = myObj.jid.split('_')[0];
				for (var i = 0, iLen = data.conferences.length; i < iLen; i++){
					if (myServerNumber == data.conferences[i].serverNumber.split('_')[1])
						firstArr.push(data.conferences[i]);
					else
						secondArr.push(data.conferences[i]);
				}
				firstArr = firstArr.concat(secondArr);
				$scope.conferences = firstArr;
			});
			$scope.confQuery = '';
			$scope.selectedConf = null;
			$scope.meToo = {};
			$scope.meToo.me;
			$scope.topUserProfile = $scope.onCall;
		}
		else if (screen == 'transfer') {
			// for queue calls, always use main call object
			if ($scope.onCall.call.type == 3){
				$scope.transferFrom = $scope.onCall.call;
			}
			else{
				if (topOrBottom == 'top'){
					$scope.transferFrom = contactService.getContact(onCallObj.xpid);
				} else if (topOrBottom == 'bottom'){
					// if party being transferred is bottom user and external...
					if (onCallObj.call.phone)
						$scope.transferFrom = onCallObj.call;
					else
						$scope.transferFrom = contactService.getContact(onCallObj.call.xpid);
				}
			}
				
			$scope.tranQuery = '';
			$scope.transferTo = null;
			$scope.sendToPrimary = true;
		}
	};

	$scope.selectConference = function(conference) {
		$scope.selectedConf = conference;
	};

	
	$scope.conferenceFilter = function(){
		var query = $scope.conf.query.toLowerCase();
		
		return function(conference){
			// conferences w/o the status property and that user doesn't have permission to join can't be joined and will break the overlay...
			// conference permissions == 0 --> can INVITE/kick/mute to conference
			if (conference.status !== undefined && conference.permissions == 0) {
				if (query == '')
					return true;
				else {
					// check members
					for (var i = 0, len = conference.members.length; i < len; i++) {
						if (conference.members[i].displayName.toLowerCase().indexOf(query) != -1)
							return true;
					}
					
					// check conference itself
					if (conference.extensionNumber.indexOf(query) != -1 || conference.name.indexOf(query) != -1)
						return true;
				}
			}
		};
	};

	$scope.transferFilter = function(){
		var query = $scope.transfer.search.toLowerCase();
		
		return function(contact){
			if (query == '' || contact.displayName.toLowerCase().indexOf(query) != -1 || contact.primaryExtension.indexOf(query) != -1){
				return true;
			}
		};
	};

	$scope.joinConference = function() {
		if ($scope.selectedConf) {
			httpService.sendAction('conferences', 'joinCall', {
				conferenceId: $scope.selectedConf.xpid,
				contactId: $scope.onCall.xpid
			});
			if ($scope.meToo.me) {
				// if I'm joining the conf, place my other calls on hold...
				phoneService.holdCalls();
				httpService.sendAction('conferences', 'joinContact', {conferenceId: $scope.selectedConf.xpid, contactId: $rootScope.myPid});
			}
			// close and redirect
			$scope.showOverlay(false);
			$location.path('/conference/' + $scope.selectedConf.xpid);
		}
		else
			$scope.addError = 'Select conference room';
	};

	/* Disabling of Barge/Monitor/Whisper Buttons --> dependent on barge permission, if external caller, and whether has been barged already */
	$scope.$watchCollection('onCall.call', function(call){
		// call ended, so close overlay
		if (!call) {
			$scope.showOverlay(false);
			return;
		}
		
		$scope.canBarge = settingsService.isEnabled(call.details.permissions, 1);
		// disable barge/monitor/whisper buttons for bottom user if external caller...
		$scope.bottomUserCanBarge = $scope.onCall.call.type == 5 || ($scope.onCall.call.displayName == "Private" && !$scope.onCall.call.fullProfile) ? false : settingsService.isEnabled(call.details.permissions, 1);
		$scope.canRecordOthers = settingsService.isEnabled(call.details.permissions, 0);
		// disable barge/monitor/whisper buttons if already being barged/monitored/whsipered...
		if ($scope.onCall.call.bargers && $scope.onCall.call.bargers.length > 0){
			$scope.alreadyBarged = $scope.onCall.call.bargers[0].call.barge == 2;
			$scope.alreadyMonitored = $scope.onCall.call.bargers[0].call.barge == 1;
			$scope.topAlreadyWhispered = $scope.onCall.call.bargers[0].call.barge == 3 && $scope.onCall.call.bargers[0].call.contactId == $scope.onCall.xpid;
			// property doesn't exist if call is not whispered already so need to run a check before setting it up
			if ($scope.onCall.call.fullProfile)
				$scope.bottomAlreadyWhispered = $scope.onCall.call.bargers[0].call.barge == 3 && $scope.onCall.call.bargers[0].call.contactId == $scope.onCall.call.fullProfile.xpid;
			else
				$scope.bottomAlreadyWhispered = false;	
		}
		// need to differentiate b/w top and bottom because external calls only apply to the bottom user in CSO...
		$scope.topUserCanBargeFinal = $scope.canBarge ? !$scope.alreadyBarged : false;
		$scope.topUserCanMonitorFinal = $scope.canBarge ? !$scope.alreadyMonitored : false;
		$scope.topUserCanWhisperFinal = $scope.canBarge ? !$scope.topAlreadyWhispered : false
		$scope.bottomUserCanBargeFinal = $scope.bottomUserCanBarge ? !$scope.alreadyBarged : false;
		$scope.bottomUserCanMonitorFinal = $scope.bottomUserCanBarge ? !$scope.alreadyMonitored : false;
		$scope.bottomUserCanWhisperFinal = $scope.bottomUserCanBarge ? !$scope.bottomAlreadyWhispered : false;
	});

	$scope.determineSteal = function(originalCall){
		if (originalCall){
			var top = settingsService.isEnabled(originalCall.permissions, 3);
		}
		// need to run a check for private caller, which will not have a fullProfile (otherwise code breaks and conference button displays)...
		if (originalCall && originalCall.call && originalCall.call.fullProfile){
			var bottomUser = contactService.getContact(originalCall.call.fullProfile.xpid);
			if (bottomUser){
				var bottom = settingsService.isEnabled(bottomUser.permissions, 3);
			}
		}
		// if either one shows up as false -> don't have steal other call perm -> disable the conf button
		if (bottom == false || top == false){
			return true;
		}
	};

	// this isn't the isXferFromEnabled personal-permission; it's the contact-based permission which determines if I can transfer another call (call I'm not a part of) from 1 party to another...
	$scope.determineTransferFrom = function(originalCall, bottom){
	  var contact = contactService.getContact(originalCall.xpid);
	  //see if the user is permitted to transfer from
      var isPermitted = settingsService.isEnabled(contact.permissions, 3);
	  //check that contact object exists
	  if(typeof contact != 'undefined')
	  {	  //check that contact's permissions exist
		if (typeof contact.permissions != 'undefined')
		{//if contact has all permissions or is permitted to transfer from
		 //check for other conditions to see if to show the transfer button or not	
		 if(contact.permissions == 0 || isPermitted)
		 {	 
		    // user might not have have the view-call-details-permission (if no perm -> then the bottom caller is always private) --> can't transfer bottom caller's call; otherwise if have the permission --> default to transfer permissions check
			// external vs private --> w/ requisite perms, you can transfer an external caller. But cannot transfer if private/don't have view-call-details perm
		    if (bottom){
		       // if the bottom caller is private (remember private is different from bottom caller being external, cuz you can transfer an external) --> can't transfer
			   if (originalCall.call && originalCall.call.displayName == "Private" && !originalCall.call.fullProfile)
			    	return false;
			   else
			    	return true;//settingsService.isEnabled(contact.permissions, 3);
		    }
		    else{
				//if there is a call object
				if(contact.call)  
				{	
				  	// top contact permission...
				  	// if other contact (the bottom contact) is external, cannot transfer top internal contact (verified on dev4 and w/ Jong on 1/18/16)
				  	if (!contact.call.fullProfile || !contact.call.fullProfile.primaryExtension)
				  		return false;
				  	else
				  		return true;//settingsService.isEnabled(contact.permissions, 3);
				}
				else//if no contact.call object
					return false;
		    }
		 }
		 else//if contact does not have transfer or all permissions
			 return false;
		}
		else//if no contact permissions object
			return false;
	  } 
	  else//if no contact object
		  return false;
	};

	$scope.canTransferToPrimaryExtension = function(){
		/* Reference (DO NOT DELETE)
		*CP Group Permission: HUD -- Transfer call to others' extensions
		*if A is on call w/ B, and want to know if A can transfer B to C's primary extension, check the [transfer call to others' extensions permission] on B */
		var personBeingTransferred = $scope.transferFrom;		
		return settingsService.isEnabled(personBeingTransferred.permissions, 3) && settingsService.isEnabled($scope.transferTo.permissions, 4) ;
	};

	$scope.canTransferToVm = function(){
		/* Reference (DO NOT DELETE)
		*CP Group Permission: HUD -- Transfer call to VM
		*if A is on call w/ B, and want to know if A can transfer B to C's VM --> check the transferToVM permission on B. */
		var personBeingTransferred = $scope.transferFrom;
		return settingsService.isEnabled(personBeingTransferred.permissions, 5);
	};

	var createTmpExternalContact = function(contactNumber){
		var externalContact = {};
		externalContact.displayName = "Unknown Number";
		externalContact.contactNumber = contactNumber;
		return externalContact;
	};

	$scope.selectDestination = function(selectionInput, display) {
		$scope.transferType = 'internal';
		
		// if clicking on the selectionBox
		if (display == 'selectionBox'){
			// if selected box is an external phone #
			var nonHypenNumber = phoneService.parseOutHyphens(selectionInput);
			// 2nd part of if branch below allows user to transfer another caller to the sytem menu (allows user to transfer to destination "0")
			if ( (!isNaN(nonHypenNumber) && selectionInput.length > 4) || ((!isNaN(selectionInput)) && (selectionInput.length == 1) && (selectionInput == 0)) || ((!isNaN(selectionInput)) && (selectionInput.length == 3) && (selectionInput == 911)) ){
				$scope.transferType = 'external';
				selectionInput = nonHypenNumber;
				$scope.transferTo = createTmpExternalContact(selectionInput);
			} 
			
			// if user does not have transfer to primary extension permission AND doesn't have transfer to VM perm -> can't advance to next transfer screen
			if (!$scope.canTransferToPrimaryExtension() && !$scope.canTransferToVm())
				return;
			
			// if selected is an internal contact, grab their contact data...
			for (var i = 0, len = $scope.transferContacts.length; i < len; i++) {
				var contact = $scope.transferContacts[i];
				
				if (contact.xpid != $rootScope.myPid && contact.xpid != $scope.transferFrom.xpid && contact.primaryExtension == selectionInput){
					$scope.transferTo = contact;
					break;
				}
			}
		} else {
			// else if clicking on recent or contacts, can't transfer my call to me or to the person i'm talking to...
			if (selectionInput.xpid != $rootScope.myPid && selectionInput.xpid != $scope.transferFrom.xpid)
				$scope.transferTo = selectionInput;
		}
	};
	
	$scope.transferCall = function() {
		if ($scope.transferTo) {
			var feed, action;
			var params = {};
			
			// set up feed and sender
			if ($scope.onCall.xpid == $rootScope.myPid) {
				feed = 'mycalls';
				params.mycallId = $scope.onCall.call.xpid;
			}
			else {
				feed = 'calls';

				if ($scope.transferFrom.call && $scope.transferFrom.call.contactId)
					params.fromContactId = $scope.transferFrom.call.contactId;
				else
					params.fromContactId = $scope.transferFrom.xpid;				
			}
			
			// receiver
			if ($scope.transferType == 'external')
				params.toNumber = $scope.transferTo.contactNumber;
			else
				params.toContactId = $scope.transferTo.xpid;
			
			// feed action
			if ($scope.transferType == 'external')
				action = 'transferTo';
			else if ($scope.transferTo.primaryExtension == '')
				action = 'transferToMobile';
			else if ($scope.who.sendToPrimary)
				action = 'transferToContact';
			else
				action = 'transferToVoicemail';
			
			httpService.sendAction(feed, action, params);
			
			recentXpids[$scope.transferTo.xpid] = $scope.transferTo.xpid;
			localStorage['recentTransfers_of_' + $rootScope.myPid] = JSON.stringify(recentXpids);
			$scope.showOverlay(false);
			ga('send', 'event', {eventCategory:'Calls', eventAction:'Transfer', eventLabel: 'via Call Control Transfer Button'});
		}
		else
			$scope.addError = 'Select destination';
	};

	contactService.getContacts().then(function(data){
		// get recent transfers
		recentXpids = localStorage['recentTransfers_of_' + $rootScope.myPid] ? JSON.parse(localStorage['recentTransfers_of_' + $rootScope.myPid]) : {};
		
		// populate transferrable contacts
		for (var i = 0, len = data.length; i < len; i++) {
			// must have valid phone #
			if (data[i].xpid != $rootScope.myPid && (data[i].primaryExtension || data[i].phoneMobile)) {
				// filter out contacts from transfer list if do not have [transfer to primary extension permission] AND [transfer to VM permission]
				if (settingsService.isEnabled(data[i].permissions, 4) || settingsService.isEnabled(data[i].permissions, 5)) {
					$scope.transferContacts.push(data[i]);
					
					// recents
					if (recentXpids[data[i].xpid])
						$scope.recentTransfers.push(data[i]);
				}
			}
		}
	});
}]);
