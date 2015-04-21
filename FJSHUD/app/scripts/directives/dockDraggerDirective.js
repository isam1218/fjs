hudweb.directive('dragger', ['HttpService', function(httpService) {
	return {
		restrict: 'A',
		link: function(scope, element, attrs) {
			// snap to position
			if ((scope.gadget.value.config.x > 0 || scope.gadget.value.config.y > 0) && (!$('#InnerDock').hasClass('ui-sortable') || $('#InnerDock').hasClass('ui-sortable-disabled'))) {
				element.addClass('Positioned');
				element.css('top', scope.gadget.value.config.y + '%');
				element.css('left', scope.gadget.value.config.x + '%');
			}
			
			if (scope.gadget.value.config.height)
				element.css('height', scope.gadget.value.config.height + 'px');
			else
				element.addClass('NoFixedHeight');
	
			$(element).draggable({
				handle: '.Header, .Content',
				containment: '#InnerDock',
				helper: 'clone',
				scroll: false,
				cursor: 'move',
				cursorAt: { top: 25 },
				zIndex: 50,
				stack: '#InnerDock .Gadget',
				connectToSortable: "#InnerDock",
				start: function() {
					// show container area
					$('#DockPanel').scrollLeft(0);
					$('#DockPanel').addClass('Moving');
					$(this).hide().addClass('Positioned');
				},
				stop: function(event, ui) {
					$(event.toElement).one('click', function(e) {
						e.preventDefault(); 
					});
					
					$('#DockPanel').removeClass('Moving');
					
					// make sure dragged element matches helper position
					$(this).show().css('top', ui.position.top + 'px').css('left', ui.position.left + 'px');
					
					var rect = document.getElementById('InnerDock').getBoundingClientRect();
					
					// save new position to db as percentage
					scope.gadget.value.config.x = ui.position.left/rect.width * 100;
					scope.gadget.value.config.y = ui.position.top/rect.height * 100;
					
					httpService.sendAction('settings', 'update', {
						name: scope.gadget.name,
						value: JSON.stringify(scope.gadget.value)
					});
				}
			});
		}
	};
}]);