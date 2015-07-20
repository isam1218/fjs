hudweb.directive('onSubmit', function() {
	// used as on-submit="callback()"
	return {
		restrict: "A",
		link: function(scope, element, attrs) {
			var timer;
			
			element.bind('keydown', function(e) {
				// submit on enter
				if (e.keyCode == 13 && !e.shiftKey) {
					e.preventDefault();
					
					if (this.value != '')
						scope.$eval(attrs.onSubmit);
				}
				
				// grow
				if (this.tagName == 'TEXTAREA') {
					clearTimeout(timer);
					
					timer = setTimeout(function() {
						element[0].style.height = '1px';
						element[0].style.height = (element[0].scrollHeight+2) + 'px';
					}, 100);
				}
			});
			
			scope.$on('$destroy', function() {
				clearTimeout(timer);
			});
		}
	};
});