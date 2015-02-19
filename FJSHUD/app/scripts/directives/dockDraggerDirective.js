hudweb.directive('dragger', function() {
	return {
		restrict: 'A',
		link: function(scope, element, attrs) {			
			$(element).draggable({
				handle: '.Header, .Scrollable',
				containment: '#DockPanel',
				cursor: 'move',
				cursorAt: { bottom: 0 },
				stack: '#DockPanel .Element',
				connectToSortable: "#DockPanel"
			});
		}
	};
});