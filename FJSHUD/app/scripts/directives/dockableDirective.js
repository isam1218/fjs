hudweb.directive('dockable', ['HttpService', '$parse', '$compile', '$rootScope', function(httpService, $parse, $compile, $rootScope) {
	var defaultImage = "this.src='img/Generic-Avatar-28.png'";
	
	return {
		restrict: 'A',
		link: function(scope, element, attrs) {
			// super important for droppable to work
			element.data('_scope', scope);
			
			$(element).draggable({
				cursorAt: { top: 25, left: 25 },
				zIndex: 50,
				appendTo: 'body',
				helper: function() {
					// object to dock
					var obj = $parse(attrs.dockable)(scope);
			
					// create visible element
					var gadget = $('<div class="Gadget"></div>');
					var header = $('<div class="Header Single"></div>');
					var title = $('<div class="Title"></div>');
					
					// avatar
					$(header).append($compile('<avatar profile="' + attrs.dockable + '" context="drag"></avatar>')(scope));
					
					// single title
					if (obj.firstName !== undefined) {						
						$(title).append('<div>' + obj.displayName + '</div><div><div class="ListRowStatusIcon XIcon-QueueStatus-' + obj.queue_status + '"></div><div class="ListRowStatusIcon XIcon-ChatStatus-' + (obj.hud_status || 'offline') + '"></div></div>');
					}
					// group
					else if (obj.name !== undefined) {						
						$(title).append('<div>' + obj.name + '</div>');
					}
					// most likely a call
					else {						
						$(title).append('<div>' + obj.displayName + '</div><div>' + obj.phone + '</div>');
					}
					
					return $(gadget).append($(header).append($(title)));
				},
				start: function(event, ui) {
					$(ui.helper).addClass('not-allowed');
				},
				stop: function(event, ui) {
					ui.helper.empty();
				}
			});
		}
	};
}]);