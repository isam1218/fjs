hudweb.directive('contextMenu', ['$rootScope', '$parse', '$timeout', function($rootScope, $parse, $timeout) {
	var timer;
	var current;

	return {
		restrict: 'A',
		link: function(scope, element, attrs) {
			var overlay = angular.element(document.getElementById('ContextMenu'));
			var buttons = overlay[0].getElementsByClassName('Button');
			var rect;
			
			element.bind('mouseenter', function(e) {
				rect = element[0].getBoundingClientRect();
				$timeout.cancel(timer);
				
				if (overlay.css('display') != 'block') {
					// delay
					timer = $timeout(function() {
						showOverlay();
				
						overlay.bind('mouseleave', function(e) {							
							// keep open if user moves back onto avatar
							for (i = 0; i < element.children().length; i++)  {
								if (e.relatedTarget == element.children()[i])
									return;
							}
							
							if (e.relatedTarget != element)
								hideOverlay(500);
						});
						
						overlay.bind('mouseenter', function(e) {
							$timeout.cancel(timer);
						});
			
						// button clicks
						angular.element(buttons).bind('click', function(e) {
							e.stopPropagation();
							hideOverlay(0);
						});
					}, 500);
				}
				else if (current != element) {
					// hovered over a new avatar
					showOverlay();
				}
					
				current = element;
			});
			
			element.bind('mouseleave', function(e) {
				// hide pop-pop
				if (overlay.css('display') != 'block')
					$timeout.cancel(timer);
				else if (e.relatedTarget.id != 'ContextMenu')
					hideOverlay(500);
			});
			
			function showOverlay() {
				// send object to controller
				var data = $parse(attrs.contextMenu)(scope);
				$rootScope.$broadcast('contextMenu', data);
				
				// position pop-pop
				overlay.css('left', (rect.left + rect.width/2) + 'px');
				overlay.css('top', (rect.top + rect.height/2) + 'px');
				overlay.css('display', 'block');
			}
			
			function hideOverlay(t) {
				timer = $timeout(function() {
					overlay.css('display', 'none');
					overlay.unbind();
				}, t);
			}
		}
	};
}]);