hudweb.controller('CallStatusOverlayController', ['$scope', '$rootScope', '$filter', '$timeout', '$location', 'ConferenceService', 'ContactService', 'HttpService', 'NtpService', 'PhoneService', 'SettingsService', function($scope, $rootScope, $filter, $timeout, $location, conferenceService, contactService, httpService, ntpService, phoneService, settingsService) {
	$scope.onCall = $scope.$parent.overlay.data;

	$scope.timeElapsed = 0;
	$scope.recordingElapsed = 0;
	
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

	$scope.transferContacts = [];
	$scope.transferType;
	$scope.recentTransfers = [];
	var recentXpids;
	var externalContact;



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
				conferenceService.getConferences().then(function(data) {
					$scope.conferences = data.conferences;
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
				$scope.recordingElapsed = $filter('date')(date - JSON.parse(localStorage.recordedAt), 'mm:ss');
		
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
			localStorage.recordedAt = JSON.stringify(ntpService.calibrateTime(new Date().getTime()));
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
				$scope.conferences = data.conferences;
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
			if (query == '' || conference.extensionNumber.indexOf(query) != 1){
				return true;
			}
			else if (conference.members){
				for (var i = 0, iLen = conference.members.length; i < iLen; i++){
					if (conference.members[i].displayName.toLowerCase().indexOf(query) != -1)
						return true;
				}
			}
		};
	};

	$scope.conFilter = function(conference){
		return (conference.extensionNumber.indexOf($scope.conf.query) != -1 || conference.name.indexOf($scope.conf.query.toLowerCase()) != -1);
	};

	$scope.transferToObj;
	$scope.selectionDisplay;

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

	$scope.transferResults;
	
	$scope.transferToObj = $scope.transfer.search;

	$scope.isStatusUndefined = function(conference){
		// conferences w/o the status property and that user doesn't have permission to join can't be joined and will break the overlay...
		// conference permissions == 0 --> can INVITE/kick/mute to conference
		if (conference.status !== undefined && conference.permissions == 0){
			return true;
		}
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

	// check to make sure the call object exists...
	if ($scope.onCall.call){
		// check barge permission...
		$scope.canBarge = settingsService.isEnabled($scope.onCall.call.details.permissions, 1);
		// disable barge/monitor/whisper buttons if external caller...
		$scope.bottomUserCanBarge = $scope.onCall.call.type == 5 ? false : settingsService.isEnabled($scope.onCall.call.details.permissions, 1);	
		$scope.canRecordOthers = settingsService.isEnabled($scope.onCall.call.details.permissions, 0);
		// disable barge/monitor/whisper buttons if already being barged/monitored/whsipered...
		if ($scope.onCall.call.bargers.length > 0){
			$scope.alreadyBarged = $scope.onCall.call.bargers[0].call.barge == 2;
			$scope.alreadyMonitored = $scope.onCall.call.bargers[0].call.barge == 1;
			$scope.topAlreadyWhispered = $scope.onCall.call.bargers[0].call.barge == 3 && $scope.onCall.call.bargers[0].call.contactId == $scope.onCall.xpid;
			$scope.bottomAlreadyWhispered = $scope.onCall.call.bargers[0].call.barge == 3 && $scope.onCall.call.bargers[0].call.contactId == $scope.onCall.call.fullProfile.xpid;
		}
	}

	$scope.determineTransferFrom = function(contactToTransfer){
	  var contact = contactService.getContact(contactToTransfer);
	  if (contact && contact.permissions){
	    return settingsService.isEnabled(contact.permissions, 3);
	  } else {
	    return true;
	  }
	};

	$scope.transferPermFilterContacts = function(){
		return function(contact){
			return settingsService.isEnabled(contact.permissions, 4);
		};
	};

	$scope.canTransferToVm = function(){
		var myContactObj = contactService.getContact($rootScope.myPid);
		// console.error('vm perm - ', settingsService.isEnabled(myContactObj.permissions, 5));
		return settingsService.isEnabled(myContactObj.permissions, 5);
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
			// if selected is an internal contact, grab their contact data...
			contactService.getContacts().then(function(data){
				for (var i = 0; i < data.length; i++){
					if (data[i].xpid != $rootScope.myPid && data[i].xpid != $scope.transferFrom.xpid && data[i].displayName.toLowerCase().indexOf(selectionInput.toLowerCase()) != -1 || data[i].primaryExtension.indexOf(selectionInput) != -1){
						$scope.transferTo = data[i];
						break;
					}
				}
			});
			// if selected box is an external phone #
			if (!isNaN(selectionInput) && selectionInput.length > 4){
				$scope.transferType = 'external';
				$scope.transferTo = createTmpExternalContact(selectionInput);
			}
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
			recentXpids.push($scope.transferTo.xpid);
			localStorage['recentTransfers_of_' + $rootScope.myPid] = JSON.stringify(recentXpids);
			$scope.showOverlay(false);
		}
		else
			$scope.addError = 'Select destination';
	};

	// grabbing recent transfers...
	contactService.getContacts().then(function(data){
		$scope.transferContacts = data;
		recentXpids = localStorage['recentTransfers_of_' + $rootScope.myPid] ? JSON.parse(localStorage['recentTransfers_of_' + $rootScope.myPid]) : [];
		for (var j = 0; j < recentXpids.length; j++){
			var singleRecent = recentXpids[j];
			for (var i = 0; i < data.length; i++){
				if (data[i].xpid == singleRecent){
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
