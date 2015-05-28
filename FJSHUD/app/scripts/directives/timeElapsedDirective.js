hudweb.directive('timer', ['$filter', '$interval', function($filter, $interval) {
	return {
		restrict: 'A',
		replace: false,
		scope: {
			timer: '=timer'
		},
		link: function(scope, element, attrs) {
			var loop, start, elapsed;
			
			// start counting immediately
			if (attrs.timer == 'now') {
				start = new Date();
				loop = $interval(updateDate, 1000);					
				updateDate();
			}
			else {
				// wait for value to initialize
				scope.$watch('timer', function(data) {
					if (data && data > 0) {
						start = new Date(data);
						
						// increment every second
						if (!loop) {
							loop = $interval(updateDate, 1000);					
							updateDate();
						}
					}
					else {
						element.html('---');
						$interval.cancel(loop);
					}
				});
			}
			
			function updateDate() {
				elapsed = new Date().getTime() - start.getTime();
				element.html($filter('duration')(elapsed));
			}
			
			scope.$on("$destroy", function () {
				$interval.cancel(loop);
			});
		}
	};
}]);