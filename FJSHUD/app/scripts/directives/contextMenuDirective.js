hudweb.directive('contextMenu', ['$rootScope', '$parse', '$timeout', function($rootScope, $parse, $timeout) {
	return {
		restrict: 'A',
		link: function(scope, element, attrs) {
			var overlay = angular.element(document.getElementById('ContextMenu'));
		
			element.bind('mouseenter', function(e) {
				// send object to controller
				contact = $parse(attrs.contextMenu)(scope);
				$rootScope.$broadcast('contextMenu', contact);
				
				// display pop-up
				overlay.css('display', 'block');
				overlay.css('left', e.clientX + 'px');
				overlay.css('top', e.clientY + 'px');
				
				overlay.bind('mouseleave', function(e) {
					overlay.css('display', 'none');
				});
			});
			
			element.bind('mouseleave', function(e) {
				if (e.relatedTarget.id != 'ContextMenu')
					overlay.css('display', 'none');
			});
		}
	};
}]);