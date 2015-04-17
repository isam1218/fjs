hudweb.controller('DockController', ['$q', '$timeout', '$location', '$scope', '$rootScope', 'HttpService', 'SettingsService', 'ContactService', 'GroupService', 'ConferenceService', 'QueueService', function($q, $timeout, $location, $scope, $rootScope, httpService, settingsService, contactService, groupService, conferenceService, queueService) {

	$scope.gadgets = {};

	if (localStorage.recent === undefined)
		localStorage.recent = '{}';

	$scope.recent = JSON.parse(localStorage.recent);

	$scope.storeRecent = function(xpid, type){
		$scope.recent = JSON.parse(localStorage.recent);
		$scope.recent[xpid] = {
			type: type,
			time: new Date().getTime()
		}
		localStorage.recent = JSON.stringify($scope.recent);
		// console.log('*storeRecent - ', $scope.recent);
		// broadcast
		$rootScope.$broadcast('recentAdded', {info: xpid});
	};
	
	$scope.$on('settings_updated', function(event, data) {
		// enable/disable grid layout
		if (data.use_column_layout == 'true') {
			$timeout(function() {
				$('#InnerDock .Gadget').draggable('disable');
			
				if ($('#InnerDock').hasClass('ui-sortable'))
					$('#InnerDock').sortable('enable');
				else {
					$('#InnerDock').sortable({
						revert: 1,
						handle: '.Header, .Content',
						start: function() {
							$('#DockPanel').addClass('Moving');
						},
						stop: function() {
							$('#DockPanel').removeClass('Moving');
						}
					});
				}
			}, 100);
		}
		else {		
			$('#InnerDock .Gadget').draggable('enable');
			
			if ($('#InnerDock').hasClass('ui-sortable'))
				$('#InnerDock').sortable('disable');
		}
		
		// wait for sync
		$q.all([contactService.getContacts(), queueService.getQueues()]).then(function() {
			for (key in data) {
				// check for dupes
				var found = false;
				
				for (g in $scope.gadgets) {
					for (i = 0; i < $scope.gadgets[g].length; i++) {
						if (key == $scope.gadgets[g][i].name) {
							found = true;
							break;
						}
					}
					
					if (found) break;
				}
				
				if (found) continue;
				
				// add new
				if (key.indexOf('GadgetConfig') != -1) {
					// gadget element
					var gadget = {
						name: key,
						value: JSON.parse(data[key]),
						data: {}
					};
					
					// create new array for each type of gadget
					if ($scope.gadgets[gadget.value.factoryId] === undefined)
						$scope.gadgets[gadget.value.factoryId] = [];
					
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
					
					if (gadget.data)
						$scope.gadgets[gadget.value.factoryId].push(gadget);
				}
			}
		});
	});
	
	$scope.$on('delete_gadget', function(event, data) {
		// remove from fdp
		httpService.sendAction('settings', 'delete', {name: data});
		
		// remove from ui
		for (g in $scope.gadgets) {
			for (i = 0; i < $scope.gadgets[g].length; i++) {
				if (data == $scope.gadgets[g][i].name) {
					$scope.gadgets[g].splice(i, 1);
					return;
				}
			}
		}
	});
	
	$scope.getContact = function(xpid) {
		return contactService.getContact(xpid);
	};
	
	$scope.$on('conferences_updated', function(event, data) {
		if (!$scope.gadgets.GadgetConferenceRoom)
			return;
			
		for (key in data) {
			for (i = 0; i < $scope.gadgets.GadgetConferenceRoom.length; i++) {
				if (data[key].xpid == $scope.gadgets.GadgetConferenceRoom[i].xpid) {
					$scope.gadgets.GadgetConferenceRoom[i] = data[key];
					break;
				}
			}
		}
	});

	$scope.isObjectEmpty = function(object){
		return !$.isEmptyObject(object);
	}
	
	$scope.parkedCalls = [];
	
	$scope.$on('parkedcalls_updated',function(event,data){
		if(data){
			for(parkedCall in data){
				if(data[parkedCall].xef001type == "delete"){
					//delete $scope.parkedCalls[data[parkedCall.xpid]];
					for (i = 0; i < $scope.parkedCalls.length;i++){
						if(data[parkedCall].xpid == $scope.parkedCalls[i].xpid){
							$scope.parkedCalls.splice(i,1);
						}
					}
				
				}else{
					var toAdd = true;
					for (i = 0; i < $scope.parkedCalls.length;i++){
						if(data[parkedCall].xpid == $scope.parkedCalls[i].xpid){
							toAdd = false;
						}
					}
					if(toAdd){
						$scope.parkedCalls.push(data[parkedCall]);
					}
				}
			}
		}
	});

	$scope.takeParkedCall = function(call){
		
	}

	$scope.joinConference = function(conference) {
		var params = {
			conferenceId: conference.xpid,
			contactId: $rootScope.myPid,
		};
		httpService.sendAction("conferences", "joinContact", params);
				
		$location.path('/conference/' + conference.xpid);
	};
}]);
