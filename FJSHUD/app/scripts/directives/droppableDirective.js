hudweb.directive('droppable', ['HttpService', 'ConferenceService', '$parse', '$location', '$rootScope', function(httpService, conferenceService, $parse, $location, $rootScope) {	
	return {
		restrict: 'A',
		link: function(scope, element, attrs) {
			var obj, type;
			
			// element can be dropped onto
			$(element).droppable({
				tolerance: 'pointer',
				greedy: true,
				over: function(event, ui) {
					// find original draggable object
					if (ui.draggable[0].attributes.dockable)
						obj = $parse(ui.draggable[0].attributes.dockable.nodeValue)(angular.element(ui.draggable).scope());
					else if (angular.element(ui.draggable).scope().gadget.data)
						obj = angular.element(ui.draggable).scope().gadget.data;
					else
						obj = null;
					
					// get type of object
					if (obj.firstName !== undefined)
						type = 'Contact';
					else if (obj.loggedInMembers !== undefined)
						type = 'QueueStat';
					else if (obj.roomNumber !== undefined)
						type = 'ConferenceRoom';
					else if (obj.name !== undefined)
						type = 'Group';
					else if (obj.record !== undefined)
						type = 'Call';
					
					// allowed cases
					if ((type != 'Call' && $(this).hasClass('InnerDock')) || (type == 'Contact' && scope.$parent.currentCall) || (type == 'Call' && scope.gadget && scope.gadget.name == 'GadgetConfig__empty_GadgetParkedCalls_')) {
						$(this).addClass('DroppableArea');
						$(ui.helper).removeClass('not-allowed');
					}
					else {
						$(this).removeClass('DroppableArea');
						$(ui.helper).addClass('not-allowed');
					}
				},
				out: function(event, ui) {
					$(this).removeClass('DroppableArea');
					$(ui.helper).addClass('not-allowed');
				},
				drop: function(event, ui) {
					$(this).removeClass('DroppableArea');
					
					// dock new item
					if (type != 'Call' && $(this).hasClass('InnerDock') && ui.draggable[0].attributes.dockable) {
						var rect = document.getElementById('InnerDock').getBoundingClientRect();
					
						var data = {
							name: 'GadgetConfig__empty_Gadget' + type + '_' + obj.xpid,
							value: JSON.stringify({
								"contextId": "empty",
								"factoryId": "Gadget" + type,
								"entityId": obj.xpid,
								"config": {
									"x": (ui.position.left - rect.left)/rect.width*100, 
									"y": (ui.position.top - rect.top)/rect.height*100
								},
								"index": 1
							})
						};
						
						httpService.sendAction('settings', 'update', data);
					}
					// start conference via active call
					else if (type == 'Contact' && scope.$parent.currentCall) {
						conferenceService.getConferences().then(function(data) {
							var found = null;
							var len = data.length;
							
							// find first empty room on same server
							for (var i = 0; i < len; i++) {
								if (data[i].serverNumber.indexOf($rootScope.meModel.server_id) != -1 && (!data[i].members || data[i].members.length == 0)) {
									found = data[i].xpid;
									break;
								}
							}
							
							// try again for linked server
							if (!found) {
								for (var i = 0; i < len; i++) {
									// find first room on same server
									if (!data[i].members || data[i].members.length == 0) {
										found = data[i].xpid;
										break;
									}
								}
							}
							
							if (found) {
								// transfer existing call
								httpService.sendAction('mycalls', 'transferToConference', {
									mycallId: scope.$parent.currentCall.xpid,
									conferenceId: found
								});
								
								// connect third party
								httpService.sendAction('conferences', 'joinContact', {
									conferenceId: found,
									contactId: obj.xpid
								});
								
								$location.path('/conference/' + found + '/currentcall');
							}
						});
					}
					// park call
					else if (type == 'Call' && scope.gadget && scope.gadget.name.indexOf('GadgetParkedCalls') != -1) {
						httpService.sendAction('mycalls', 'transferToPark', {
							mycallId: obj.xpid
						});
					}
				}
			});
		}
	};
}]);