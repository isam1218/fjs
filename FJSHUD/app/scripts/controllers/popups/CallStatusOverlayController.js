hudweb.controller('CallStatusOverlayController', ['$scope', '$rootScope', '$filter', '$timeout', '$location', 'ConferenceService', 'ContactService', 'HttpService', 'NtpService', 'PhoneService', 'SettingsService', function($scope, $rootScope, $filter, $timeout, $location, conferenceService, contactService, httpService, ntpService, phoneService, settingsService) {
	$scope.onCall = $scope.$parent.overlay.data;

	$scope.timeElapsed = 0;
	$scope.recordingElapsed = 0;
	
	$scope.conferences = [];
	$scope.conf = this;
	$scope.conf.query = '';
	$scope.confQuery = this;
	$scope.confQuery.query = '';
	$scope.transfer = this;
	$scope.transfer.search = '';
	$scope.selectedConf = null;
	$scope.addError = null;
	$scope.contacts = [];
	$scope.who = {};
	$scope.who.sendToPrimary = true;
	$scope.alreadyBarged = false;
	$scope.alreadyMonitored = false;
	$scope.topAlreadyWhispered = false;
	$scope.bottomAlreadyWhispered = false;

	$scope.selectionDisplay;
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
				contactService.getContacts().then(function(data) { 
					$scope.contacts = data;
				});

				if(!$scope.transferFrom){
					$scope.transferFrom = $scope.onCall.call;
				}
				break;
			case 'conference':
				// sort by displaying home server conference rooms first...
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

	var updateTime = function() {
		if ($scope.onCall.call) {
						
			var startTime = $scope.onCall.call.startedAt ? $scope.onCall.call.startedAt : $scope.onCall.call.created;
			// format date			
			var date = ntpService.calibrateTime(new Date().getTime());

			$scope.timeElapsed = $filter('date')(date - startTime, 'mm:ss');
			
			// also get recorded time
			if ($scope.onCall.call.recorded)
				$scope.recordingElapsed = $filter('date')(date - $scope.onCall.call.recordedStartTime, 'mm:ss');
		
			// increment
			if ($scope.$parent.overlay.show)
				$timeout(updateTime, 1000);
		}
		else
			$scope.showOverlay(false);
	};
	
	updateTime();
	
	$scope.getCallStatusAvatar = function(call) {
		if (call && call.contactId)
			return httpService.get_avatar(call.contactId, 28, 28);
		else
			return 'img/Generic-Avatar-28.png';
	};
	
	$scope.bargeCall = function(type, xpid) {
		httpService.sendAction('contacts', type + 'Call', {contactId: xpid});
		$scope.showOverlay(false);
	};
	
	$scope.recordCall = function() {
		var action = '';
		if (!$scope.onCall.call.recorded) {
			$scope.onCall.call.recorded = true;
			$scope.recordingElapsed = '00:00';
			
			action = 'startCallRecording';
			updateTime();
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
	
	$scope.changeScreen = function(screen, xpid) {
		if(toClose){
			$scope.showOverlay(false);
			return;
		}

		$scope.screen = screen;
		$scope.addError = null;
		
		if (screen == 'conference') {
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
		}
		else if (screen == 'transfer') {
			$scope.transferFrom = contactService.getContact(xpid);
			$scope.tranQuery = '';
			$scope.transferTo = null;
			$scope.sendToPrimary = true;
			
			contactService.getContacts().then(function(data) { 
				$scope.contacts = data;
			});
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
				$scope.selectionDisplay = query;
				return true;
			} else if (!isNaN($scope.transfer.search) && $scope.transfer.search.length > 4)
				$scope.selectionDisplay = query;
			else
				return false;
		};
	};

	$scope.joinConference = function() {
		if ($scope.selectedConf) {
			httpService.sendAction('conferences', 'joinCall', {
				conferenceId: $scope.selectedConf.xpid,
				contactId: $scope.onCall.xpid
			});
			if ($scope.meToo.me) {
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
	$scope.$watch('onCall.call.details', function(callDetails){
		$scope.canBarge = settingsService.isEnabled(callDetails.permissions, 1);
		// disable barge/monitor/whisper buttons for bottom user if external caller...
		$scope.bottomUserCanBarge = $scope.onCall.call.type == 5 ? false : settingsService.isEnabled(callDetails.permissions, 1);
		$scope.canRecordOthers = settingsService.isEnabled(callDetails.permissions, 0);
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

	// this isn't the isXferFromEnabled personal-permission; it's the contact-based permission which determines if I can transfer another call (call I'm not a part of) from 1 party to another...
	$scope.determineTransferFrom = function(contactToTransfer){
	  var contact = contactService.getContact(contactToTransfer);
	  if (contact && contact.permissions){
	    return settingsService.isEnabled(contact.permissions, 3);
	  } else {
	    return true;
	  }
	};

	$scope.transferPermFilterContacts = function(){
		// filter out contacts from transfer list if do not have [transfer to primary extension permission] AND [transfer to VM permission]
		return function(contact){
			return settingsService.isEnabled(contact.permissions, 4) || settingsService.isEnabled(contact.permissions, 5);
		};
	};

	$scope.canTransferToPrimaryExtension = function(){
		/* Reference (DO NOT DELETE)
		*CP Group Permission: HUD -- Transfer call to others' extensions
		*if A is on call w/ B, and want to know if A can transfer B to C's primary extension, check the [transfer call to others' extensions permission] on B */
		var personBeingTransferred = $scope.transferFrom;
		return settingsService.isEnabled(personBeingTransferred.permissions, 4);
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
		// if clicking on the selectionBox
		if (display == 'selectionBox'){
			// if selected box is an external phone #
			if (!isNaN(selectionInput) && selectionInput.length > 4){
				$scope.transferType = 'external';
				$scope.transferTo = createTmpExternalContact(selectionInput);
			} 
			// if user does not have transfer to primary extension permission AND doesn't have transfer to VM perm -> can't advance to next transfer screen
			if (!$scope.canTransferToPrimaryExtension() && !$scope.canTransferToVm())
				return;
			// if selected is an internal contact, grab their contact data...
			contactService.getContacts().then(function(data){
				for (var i = 0; i < data.length; i++){
					if (data[i].xpid != $rootScope.myPid && data[i].xpid != $scope.transferFrom.xpid && data[i].displayName.toLowerCase().indexOf(selectionInput.toLowerCase()) != -1 || data[i].primaryExtension.indexOf(selectionInput) != -1){
						$scope.transferTo = data[i];
						break;
					}
				}
			});
		} else {
			// else if clicking on recent or contacts, can't transfer my call to me or to the person i'm talking to...
			if (selectionInput.xpid != $rootScope.myPid && selectionInput.xpid != $scope.transferFrom.xpid)
				$scope.transferTo = selectionInput;
		}
	};
	
	$scope.transferCall = function() {
		if ($scope.transferTo) {
			if ($scope.transferType == 'external')
				phoneService.transfer($scope.onCall.call.xpid, $scope.transferTo.contactNumber);
			else if ($scope.onCall.xpid == $rootScope.meModel.my_pid){
				httpService.sendAction('mycalls', $scope.who.sendToPrimary ? 'transferToContact' : 'transferToVoicemail', {
					mycallId: $scope.onCall.call.xpid,
					toContactId: $scope.transferTo.xpid
				});
			}else{
				httpService.sendAction('calls', $scope.who.sendToPrimary ? 'transferToContact' : 'transferToVoicemail', {
					fromContactId: $scope.onCall.call.xpid,
					toContactId: $scope.transferTo.xpid
				});
			}
			recentXpids[$scope.transferTo.xpid] = $scope.transferTo.xpid;
			localStorage['recentTransfers_of_' + $rootScope.myPid] = JSON.stringify(recentXpids);
			$scope.showOverlay(false);
		}
		else
			$scope.addError = 'Select destination';
	};

	contactService.getContacts().then(function(data){
		$scope.transferContacts = data;
		recentXpids = localStorage['recentTransfers_of_' + $rootScope.myPid] ? JSON.parse(localStorage['recentTransfers_of_' + $rootScope.myPid]) : {};
		for (var xpid in recentXpids){
			for (var i = 0; i < data.length; i++){
				if (data[i].xpid == xpid){
					$scope.recentTransfers.push(data[i]);
					break;
				}
			}
		}
	});

  $scope.$on("$destroy", function() {
		updateTime = null;
  });
}]);
