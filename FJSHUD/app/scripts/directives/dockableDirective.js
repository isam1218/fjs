hudweb.directive('dockable', ['HttpService', '$parse', function(httpService, $parse) {
	var defaultImage = "this.src='img/Generic-Avatar-28.png'";
	
	return {
		restrict: 'A',
		link: function(scope, element, attrs) {
			// object to dock
			var obj = $parse(attrs.dockable)(scope);
			var type;
			
			// get type
			if (obj.firstName !== undefined)
				type = 'Contact';
			else if (obj.loggedInMembers !== undefined)
				type = 'QueueStat';
			else if (obj.roomNumber !== undefined)
				type = 'ConferenceRoom';
			else if (obj.parkExt !== undefined)
				type = 'ParkedCall';
			else if (obj.name)
				type = 'Group';
			else
				return;
			
			$(element).draggable({
				helper: function() {
					// create visible element
					var gadget = $('<div class="Gadget"></div>');
					var header = $('<div class="Header Single"></div>');
					var title = $('<div class="Title"></div>');
					
					// single
					if (type == 'Contact') {
						$(header).append('<div class="Avatar AvatarNormal"><img class="AvatarImgPH" src="' + obj.getAvatar(28) + '" onerror="' + defaultImage + '" /></div>');
						
						$(title).append('<div>' + obj.displayName + '</div><div><div class="ListRowStatusIcon XIcon-QueueStatus-' + obj.queue_status + '"></div><div class="ListRowStatusIcon XIcon-ChatStatus-' + (obj.hud_status || 'offline') + '"></div></div>');
					}
					// group
					else {
						$(header).append('<div class="Avatar AvatarNormal"><div class="GroupAvatarItem GroupAvatarItem_0"><img class="GroupAvatarItemImg" src="' + obj.getAvatar(0, 28) + '" onerror="' + defaultImage + '" /></div><div class="GroupAvatarItem GroupAvatarItem_1"><img class="GroupAvatarItemImg" src="' + obj.getAvatar(1, 28) + '" onerror="' + defaultImage + '" /></div><div class="GroupAvatarItem GroupAvatarItem_2"><img class="GroupAvatarItemImg" src="' + obj.getAvatar(2, 28) + '" onerror="' + defaultImage + '" /></div><div class="GroupAvatarItem GroupAvatarItem_3"><img class="GroupAvatarItemImg" src="' + obj.getAvatar(3, 28) + '" onerror="' + defaultImage + '" /></div><div class="AvatarInteractable"></div></div>');
						
						$(title).append('<div>' + obj.name + '</div>');
					}
					
					return $(gadget).append($(header).append($(title)));
				},
				cursor: 'move',
				cursorAt: { top: 25, left: 25 },
				zIndex: 50,
				appendTo: 'body',
				drag: function(event, ui) {
					var rect = document.getElementById('InnerDock').getBoundingClientRect();
					
					// if inside dock, show droppable area
					if (ui.position.left >= rect.left && ui.position.top >= rect.top) {
						$('body').removeClass('not-allowed');
						$('#DockPanel').addClass('Moving');
					}
					else {
						$('body').addClass('not-allowed');
						$('#DockPanel').removeClass('Moving');
					}
				},
				stop: function(event, ui) {
					$('body').removeClass('not-allowed');
					$('#DockPanel').removeClass('Moving');
					
					var rect = document.getElementById('InnerDock').getBoundingClientRect();
					
					// if inside dock, save it
					if (ui.position.left >= rect.left && ui.position.top >= rect.top) {
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
				}
			});
		}
	};
}]);