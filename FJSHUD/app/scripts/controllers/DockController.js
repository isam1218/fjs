hudweb.controller('DockController', ['$q', '$scope', '$rootScope', 'HttpService', 'ContactService', 'GroupService', 'ConferenceService', 'QueueService', function($q, $scope, $rootScope, httpService, contactService, groupService, conferenceService, queueService) {
	$scope.grid = true;
	$scope.gadgets = [];
	
	$scope.$on('settings_synced', function(event, data) {
		$scope.gadgets = [];
		
		// wait for sync
		$q.all([contactService.getContacts(), queueService.getQueues()]).then(function() {
			for (key in data) {
				if (data[key].key == 'use_column_layout') {
					// enable/disable grid layout
					if (data[key].value == 'true') {
						$scope.grid = true;
						
						$('#DockPanel').sortable({
							revert: 1,
							handle: '.Header, .Scrollable'
						});
					}
					else {
						$scope.grid = false;
						
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
					}
					
					$scope.gadgets.push(gadget);
				}
			}
		});
	});
}]);
