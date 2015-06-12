hudweb.directive('timer', ['$filter', '$interval', 'NtpService', function($filter, $interval, ntpService) {
	return {
		restrict: 'A',
		replace: false,
		scope: {
			timer: '=timer'
		},
		link: function(scope, element, attrs) {
			var loop, start, elapsed,calibrate;
			calibrate = true;
			// start counting immediately
			if (attrs.timer == 'now') {
				
				start = new Date();
				calibrate = false;
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
				if(calibrate){
					elapsed = ntpService.calibrateTime(new Date().getTime()) - start;
				}else{
					elapsed = new Date().getTime() - start;
				}
				
				element.html($filter('duration')(elapsed));
			}
			
			scope.$on("$destroy", function () {
				$interval.cancel(loop);
			});
		}
	};
}]);