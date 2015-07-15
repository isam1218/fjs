hudweb.directive('droppable', ['HttpService', 'ConferenceService', '$parse', '$location', '$rootScope', function(httpService, conferenceService, $parse, $location, $rootScope) {
	var timeout;
	
	// used as droppable="Type,Type,Type"
	return {
		restrict: 'A',
		link: function(scope, element, attrs) {
			var obj, type;
			var drops = attrs.droppable.split(',');
			
			// element can be dropped onto
			$(element).droppable({
				tolerance: 'pointer',
				greedy: true,
				over: function(event, ui) {
					var isolatedScope = angular.element(ui.draggable).data('_scope');
					
					// find original draggable object
					if (ui.draggable[0].attributes.dockable)
						obj = $parse(ui.draggable[0].attributes.dockable.nodeValue)(isolatedScope);
					else if (isolatedScope.gadget.data)
						obj = isolatedScope.gadget.data;
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
					
					// check for allowed cases
					if (drops.indexOf(type) != -1 && (!$(this).hasClass('InnerDock') || obj.xpid != $rootScope.myPid)) {
						$(this).addClass('DroppableArea');
						$(ui.helper).removeClass('not-allowed');
					}
				},
				out: function(event, ui) {
					$(this).removeClass('DroppableArea');
					
					if ($('.DroppableArea').length == 0)
						$(ui.helper).addClass('not-allowed');
				},
				drop: function(event, ui) {
					$('.DroppableArea').removeClass('DroppableArea');
					
					// re-check basic criteria
					if (timeout || drops.indexOf(type) == -1)
						return;
					
					// dock new item
					if ($(this).hasClass('InnerDock') && ui.draggable[0].attributes.dockable) {
						// can't dock yourself
						if (obj.xpid == $rootScope.myPid)
							return;
						
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
					else if (scope.$parent.currentCall) {
						conferenceService.getConferences().then(function(data) {
							var conferences = data.conferences;
							var found = null;
							var len = conferences.length;
							
							// find first empty room on same server
							for (var i = 0; i < len; i++) {
								if (conferences[i].serverNumber.indexOf($rootScope.meModel.server_id) != -1 && conferences[i].status && (!conferences[i].members || conferences[i].members.length == 0)) {
									found = conferences[i].xpid;
									break;
								}
							}
							
							// try again for linked server
							if (!found) {
								for (var i = 0; i < len; i++) {
									// find first room on same server
									if (conferences[i].status && !conferences[i].members || conferences[i].members.length == 0) {
										found = conferences[i].xpid;
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
								
								// add a brief timeout before adding the second user to the conference
								timeout = setTimeout(function() {
									httpService.sendAction('conferences', 'joinContact', {
										conferenceId: found,
										contactId: obj.xpid
									});

								}, 2000);
								
								
								$location.path('/conference/' + found + '/currentcall');
							}
						});
					}
					// join conference normally
					else if (scope.conference || (scope.item && scope.item.recent_type == 'conference') || (scope.gadget && scope.gadget.name.indexOf('ConferenceRoom') != -1)) {
						var xpid = scope.conference ? scope.conference.xpid : scope.gadget ? scope.gadget.data.xpid : scope.item.xpid;
						
						if (type == 'Contact') {
							httpService.sendAction('conferences', 'joinContact', {
								conferenceId: xpid,
								contactId: obj.fullProfile ? obj.fullProfile.xpid : obj.xpid,
							});
						}
						else {
							httpService.sendAction('mycalls', 'transferToConference', {
								mycallId: obj.xpid,
								conferenceId: xpid,
							});
						
							$location.path('/conference/' + xpid + '/currentcall');
						}
					}
					// park call
					else if (scope.gadget && scope.gadget.name.indexOf('GadgetParkedCalls') != -1) {
						httpService.sendAction('mycalls', 'transferToPark', {
							mycallId: obj.xpid
						});
					}
					// transfer call
					else {
						// contact id comes from multiple places
						var xpid;
						
						if (scope.contact)
							xpid = scope.contact.xpid;
						else if (scope.member)
							xpid = scope.member.contactId;
						else if (scope.gadget)
							xpid = scope.gadget.data.xpid;
						else if (scope.item)
							xpid = scope.item.xpid;
						
						httpService.sendAction('calls', 'transferToContact', {
							fromContactId: $rootScope.myPid,
							toContactId: xpid
						});
					}
					
					// prevent sibling overlap
					timeout = setTimeout(function() {
						timeout = null;
					}, 100);
				}
			});
		}
	};
}]);