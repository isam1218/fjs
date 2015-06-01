hudweb.directive('contextMenu', ['$rootScope', '$parse', '$timeout', function($rootScope, $parse, $timeout) {
	var timer;
	var current;

	// used as context-menu="object|scopeName"
	return {
		restrict: 'A',
		link: function(scope, element, attrs) {
			var overlay = angular.element(document.getElementById('ContextMenu'));
			var arrow = angular.element(overlay[0].getElementsByClassName('Arrow')[0]);
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
							for (var i = 0; i < element.children().length; i++)  {
								if (e.relatedTarget == element.children()[i])
									return;
							}
							
							if (e.relatedTarget != element)
								hideOverlay(500);
						});
						
						overlay.bind('mouseenter', function(e) {
							$timeout.cancel(timer);
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
				else if (e.relatedTarget && e.relatedTarget.id != 'ContextMenu')
					hideOverlay(500);
			});
			
			function showOverlay() {
				// eval object before sending to controller
				var data = attrs.contextMenu.split('|');				
				data = {
					obj: $parse(data[0])(scope),
					widget: data[1] ? $parse(data[1])(scope) : null
				};
				
				// cancel if no data
				if (!data.obj && data.widget != 'recordings')
					return;
				
				$rootScope.$broadcast('contextMenu', data);
				
				$timeout(function() {
					// position pop-pop
					overlay.css('left', (rect.left + rect.width/2) + 'px');
					overlay.css('top', (rect.top + rect.height/2) + 'px');
					overlay.css('display', 'block');
					overlay.css('width', 'auto');
					
					// switch sides
					var oRect = overlay[0].getBoundingClientRect();
					
					if (rect.left + rect.width/2 + oRect.width >= window.innerWidth) {
						arrow.removeClass('Left').addClass('Right');
						overlay.css('left', (rect.left - oRect.width) + 'px');
					}
					else
						arrow.removeClass('Right').addClass('Left');
					
					// set width for logout reasons
					overlay.css('width', oRect.width + 'px');
			
					// button clicks
					angular.element(buttons).bind('click', function(e) {
						e.stopPropagation();
						
						// logout button shouldn't close
						if (this.className.indexOf('Logout') == -1)
							hideOverlay(0);
						else {
							var diff = window.innerHeight - oRect.top - oRect.height - 10;
							$('#ContextMenu .List').css('height', diff + 'px');
						}
					});
				}, 10);
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