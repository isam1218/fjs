hudweb.controller('DockController', ['$q', '$timeout', '$location', '$scope', '$rootScope', 'HttpService', 'ContactService', 'GroupService', 'ConferenceService', 'QueueService', function($q, $timeout, $location, $scope, $rootScope, httpService, contactService, groupService, conferenceService, queueService) {

	$scope.gadgets = {};
	
	$scope.$on('settings_synced', function(event, data) {
		$scope.gadgets = {};
		
		// wait for sync
		$q.all([contactService.getContacts(), queueService.getQueues()]).then(function() {
			for (key in data) {
				if (data[key].key == 'use_column_layout') {
					// enable/disable grid layout
					if (data[key].value == 'true') {
						$timeout(function() {
							$('#DockPanel').sortable({
								revert: 1,
								handle: '.Header, .Content'
							});
						}, 100);
					}
					else {						
						try {
							$('#DockPanel').sortable('disable');
						}
						catch(e) { }
					}
				}
				else if (data[key].key.indexOf('GadgetConfig') != -1) {
					// gadget element
					var gadget = {
						name: data[key].key,
						value: JSON.parse(data[key].value),
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
							gadget.data = queueService.getUserQueues($rootScope.myPid);
							break;
					}
					
					if (gadget.data.members) {	
						// get complete contact data
						angular.forEach(gadget.data.members, function(obj, i) {
							if (obj.contactId)
								gadget.data.members[i] = contactService.getContact(obj.contactId);
						});
					}
					
					$scope.gadgets[gadget.value.factoryId].push(gadget);
				}
			}
			
			$scope.$safeApply();
		});
	});
	
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
			
		$scope.$safeApply();
	});
	
	$scope.joinConference = function(conference) {
		var params = {
			conferenceId: conference.xpid,
			contactId: $rootScope.myPid,
		};
		httpService.sendAction("conferences", "joinContact", params);
				
		$location.path('/conference/' + conference.xpid);
	};
}]);
