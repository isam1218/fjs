hudweb.directive('dragger', function() {
	return {
		restrict: 'A',
		link: function(scope, element, attrs) {			
			$(element).draggable({
				handle: '.Header, .Content',
				containment: '#DockPanel',
				cursor: 'move',
				cursorAt: { bottom: 0 },
				stack: '#DockPanel .Gadget',
				connectToSortable: "#DockPanel",
				start: function() {
					$('#DockPanel').addClass('Moving');
				},
				stop: function() {
					$('#DockPanel').removeClass('Moving');
				}
			});
		}
	};
});