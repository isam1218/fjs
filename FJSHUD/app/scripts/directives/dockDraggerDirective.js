hudweb.directive('dragger', ['HttpService', function(httpService) {
	return {
		restrict: 'A',
		link: function(scope, element, attrs) {
			// snap to position
			if (!$('#DockPanel').hasClass('ui-sortable') || $('#DockPanel').hasClass('ui-sortable-disabled')) {
				element.css('top', scope.gadget.value.config.y + '%');
				element.css('left', scope.gadget.value.config.x + '%');
			}
			
			if (scope.gadget.value.config.height)
				element.css('height', scope.gadget.value.config.height + 'px');
			else
				element.addClass('NoFixedHeight');
	
			$(element).draggable({
				handle: '.Header, .Content',
				containment: '#DockPanel',
				cursor: 'move',
				cursorAt: { bottom: 0 },
				stack: '#DockPanel .Gadget',
				connectToSortable: "#DockPanel",
				start: function(e) {
					$('#DockPanel').addClass('Moving');
				},
				stop: function(event) {
					$(event.toElement).one('click', function(e) { 
						e.preventDefault(); 
					});
					
					$('#DockPanel').removeClass('Moving');
					
					if (!$('#DockPanel').hasClass('ui-sortable') || $('#DockPanel').hasClass('ui-sortable-disabled')) {
						// save new position to db
						var position = $(this).position();
						var rect = document.getElementById('DockPanel').getBoundingClientRect();
						
						scope.gadget.value.config.x = position.left/rect.width * 100;
						scope.gadget.value.config.y = position.top/rect.height * 100;
						
						httpService.sendAction('settings', 'update', {
							name: scope.gadget.name,
							value: JSON.stringify(scope.gadget.value)
						});
					}
				}
			});
		}
	};
}]);