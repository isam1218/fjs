hudweb.directive('contextMenu', ['$rootScope', '$parse', '$timeout', function($rootScope, $parse, $timeout) {
	var timer;
	var current;

	return {
		restrict: 'A',
		link: function(scope, element, attrs) {
			var overlay = angular.element(document.getElementById('ContextMenu'));
			var rect = element[0].getBoundingClientRect();
			
			element.bind('mouseenter', function(e) {				
				$timeout.cancel(timer);
				
				if (overlay.css('display') != 'block') {
					// delay
					timer = $timeout(function() {
						showOverlay(e);
				
						overlay.bind('mouseleave', function(e) {							
							// keep open if user moves back onto avatar
							for (i = 0; i < element.children().length; i++)  {
								if (e.relatedTarget == element.children()[i])
									return;
							}
							
							if (e.relatedTarget != element)
								hideOverlay();
						});
						
						overlay.bind('mouseenter', function(e) {
							$timeout.cancel(timer);
						});
					}, 500);
				}
				else if (current != element) {
					// hovered over a new avatar
					showOverlay(e);
				}
					
				current = element;
			});
			
			element.bind('mouseleave', function(e) {
				if (e.relatedTarget.id != 'ContextMenu')
					hideOverlay();
			});
			
			function showOverlay(e) {
				// send object to controller
				contact = $parse(attrs.contextMenu)(scope);
				$rootScope.$broadcast('contextMenu', contact);
				
				// position pop-pop
				overlay.css('left', e.clientX + 'px');
				overlay.css('top', e.clientY + 'px');
				overlay.css('display', 'block');
			}
			
			function hideOverlay() {
				timer = $timeout(function() {
					overlay.css('display', 'none');
					overlay.unbind();
				}, 500);
			}
		}
	};
}]);