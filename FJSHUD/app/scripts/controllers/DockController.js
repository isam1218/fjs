hudweb.controller('DockController', ['$q', '$timeout', '$location', '$scope', '$rootScope', 'HttpService', 'SettingsService', 'ContactService', 'GroupService', 'ConferenceService', 'QueueService', function($q, $timeout, $location, $scope, $rootScope, httpService, settingsService, contactService, groupService, conferenceService, queueService) {
	var column;
	var request;
	
	$scope.gadgets = [];
	$scope.parkedCalls = [];
	$scope.upload_time = 0;	
	$scope.upload_progress = 0;
	$scope.queueThresholds = {};
	
	$rootScope.dockIndex = 0;
	
	httpService.get_upload_progress().then(function(data){
		$scope.upload_progress = data.progress;
		request = data.xhr;	
	},function(error){},function(data){
		$scope.upload_progress = data.progress;
		request = data.xhr;	
		if(data.started){
			$scope.upload_time = new Date().getTime();
		}
		if(data.progress == 100){
			$timeout(function(){$scope.upload_progress = 0;},1000);
		}	
		
	});

	$scope.cancelUpload = function(){
		if(request){
			request.abort();
		}
	};
	
	var updateDock = function(data) {			
		for (var key in data) {
			// look for gadgets
			if (key.indexOf('GadgetConfig') != -1) {
				// check for dupes				
				var found = false;
				
				for (var i = 0, len = $scope.gadgets.length; i < len; i++) {
					if (key == $scope.gadgets[i].name) {
						found = true;
						break;
					}
				}
				
				if (found) continue;
			
				// add new
				var gadget = {
					name: key,
					value: JSON.parse(data[key]),
					data: {}
				};
				
				switch (gadget.value.factoryId) {
					case 'GadgetContact':
						gadget.data = contactService.getContact(gadget.value.entityId);
						break;
					case 'GadgetGroup':
						gadget.data = groupService.getGroup(gadget.value.entityId);
						break;
					case 'GadgetConferenceRoom':
						gadget.data = conferenceService.getConference(gadget.value.entityId);
						break;
					case 'GadgetQueueStat':
						gadget.data = queueService.getQueue(gadget.value.entityId);
						break;
					case 'GadgetUserQueues':
						gadget.data = queueService.getMyQueues();
						break;
				}
				
				if (gadget.data) {
					$scope.gadgets.push(gadget);
					
					// update index
					if (gadget.value.index >= $rootScope.dockIndex)
						$rootScope.dockIndex = (gadget.value.index + 1);
				}
			}
		}
		
		// enable/disable grid layout
		if (data.use_column_layout == 'true') {
			$timeout(function() {
				// update draggable status
				$('#InnerDock .Gadget').draggable('disable');
			
				// turn sorting on for first time
				if (!column) {
					column = true;
					
					if ($('#InnerDock').hasClass('ui-sortable'))
						$('#InnerDock').sortable('enable');
					else {
						$('#InnerDock').sortable({
							revert: 1,
							handle: '.Header, .List',
							helper: 'clone',
							appendTo: 'body',
							cursorAt: { top: 25 },
							start: function(event, ui) {
								// visual cues
								$(ui.helper).addClass('ui-draggable-dragging');
								ui.placeholder.height(ui.helper[0].scrollHeight);
							}
						});
					}
				}
			}, 100, false);
		}
		else {			
			// update draggable status
			$('#InnerDock .Gadget').draggable('enable');
			
			// turn sorting off for first time
			if ((column || column === undefined) && $('#InnerDock').hasClass('ui-sortable')) {
				column = false;
				
				$('#InnerDock').sortable('disable');
			}
		}
		
		// thresholds
		$scope.queueThresholds.waiting = parseInt(data.queueWaitingThreshold);
		$scope.queueThresholds.avg_wait = parseInt(data.queueAvgWaitThreshold);
		$scope.queueThresholds.avg_talk = parseInt(data.queueAvgTalkThresholdThreshold);
		$scope.queueThresholds.abandoned = parseInt(data.queueAbandonThreshold);
	};
	
	var makeDefault = function(name) {
		// add gadget manually
		$scope.gadgets.push({
			name: 'GadgetConfig__empty_' + name + '_',
			value: {
				factoryId: name,
				index: 1,
				contextId: 'empty',
				entityId: '',
				config: {}
			},
			data: {}
		});
		
		// bump up dock index
		if ($rootScope.dockIndex <= 1)
			$rootScope.dockIndex++;
	};

	// initial sync
	$q.all([settingsService.getSettings(), contactService.getContacts(), queueService.getQueues()]).then(function(data) {		
		updateDock(data[0]);
		
		// check for default gadgets
		var hasQueues = false;
		var hasParked = false;
		
		for (var i = 0, len = $scope.gadgets.length; i < len; i++) {
			if ($scope.gadgets[i].value.factoryId == 'GadgetUserQueues')
				hasQueues = true;
			
			if ($scope.gadgets[i].value.factoryId == 'GadgetParkedCalls')
				hasParked = true;
		}
		
		if (!hasQueues) {
			makeDefault('GadgetUserQueues');
			$scope.gadgets[$scope.gadgets.length-1].data = queueService.getMyQueues();
		}
		
		if (!hasParked)
			makeDefault('GadgetParkedCalls');
		
		// normal updates
		$scope.$on('settings_updated', function(event, data) {
			updateDock(data);
		});
	});
  
	$scope.getDroppableType = function(type) {
		if (type == 'GadgetConferenceRoom')
			return 'Contact,Call';
		else if (type == 'GadgetParkedCalls' || type == 'GadgetContact')
			return 'Call';
		
		return '';
	};
	
	$scope.$on('delete_gadget', function(event, data) {
		// remove from fdp
		httpService.sendAction('settings', 'delete', {name: data});
		
		// remove from ui
		for (var i = 0, len = $scope.gadgets.length; i < len; i++) {
			if (data == $scope.gadgets[i].name) {
				$scope.gadgets.splice(i, 1);
				break;
			}
		}
	});
	
	$scope.$on('parkedcalls_synced',function(event,data){
		for (var i = 0, len = data.length; i < len; i++){
			if(data[i].xef001type == "delete"){
				for (var p = 0, pLen = $scope.parkedCalls.length; p < pLen; p++){
					if(data[i].xpid == $scope.parkedCalls[p].xpid){
						$scope.parkedCalls.splice(p,1);
						pLen--;
					}
				}
			
			}
			else{
				var toAdd = true;
				for (var p = 0, pLen = $scope.parkedCalls.length; p < pLen; p++){
					if(data[i].xpid == $scope.parkedCalls[p].xpid){
						toAdd = false;
					}
				}
				if(toAdd){
					// add profile
					if (data[i].callerContactId)
						data[i].fullProfile = contactService.getContact(data[i].callerContactId);
					
					$scope.parkedCalls.push(data[i]);
				}
			}
		}
	});
	
	$scope.showCallStatus = function($event, contact) {
		$event.stopPropagation();
        $event.preventDefault();
		
		// permission?
		if (contact.call.type == 0 || contact.call.contactId == $rootScope.myPid)
			return;
	
		$scope.showOverlay(true, 'CallStatusOverlay', contact);
	};

	$scope.joinConference = function(conference) {
		var params = {
			conferenceId: conference.xpid,
			contactId: $rootScope.myPid,
		};
		httpService.sendAction("conferences", "joinContact", params);
				
		$location.path('/conference/' + conference.xpid);
	};

}]);
