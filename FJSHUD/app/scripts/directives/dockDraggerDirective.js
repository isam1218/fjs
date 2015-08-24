hudweb.directive('dragger', ['HttpService', function(httpService) {
	return {
		restrict: 'A',
		link: function(scope, element, attrs) {
			// super important for droppable to work
			element.data('_scope', scope);
			
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
				handle: '.Header, .List',
				helper: 'clone',
				appendTo: 'body',
				scroll: false,
				iframeFix: true,
				cursorAt: { top: 25 },
				zIndex: 50,
				stack: '#InnerDock .Gadget',
				connectToSortable: "#InnerDock",
				start: function() {
					// show container area
					$('#DockPanel').scrollLeft(0);
					$(this).hide().addClass('Positioned');
				},
				stop: function(event, ui) {
					$(event.toElement).one('click', function(e) {
						e.preventDefault(); 
					});	

					$(this).show();
					
					var rect = document.getElementById('InnerDock').getBoundingClientRect();
					
					// if inside dock...
					if (ui.position.left >= rect.left && ui.position.top >= rect.top && ui.position.top < rect.bottom - 25) {
						var top = ui.position.top - rect.top;
						var left = ui.position.left - rect.left;
						
						// make sure dragged element matches helper position
						$(this).css('top', top + 'px').css('left', left + 'px');
						
						// save new position to db as percentage
						scope.gadget.value.config.x = left/rect.width * 100;
						scope.gadget.value.config.y = top/rect.height * 100;
						
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