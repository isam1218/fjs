hudweb.directive('resizer', function() {
	return {
		restrict: 'E',
		replace: true,
		template: '<div class="Resizer"><div></div></div>',
		link: function(scope, element, attrs) {			
			element.bind('mousedown', function() {
				document.body.onmousemove = function(e) {
					// prevent getting too big
					var rect = document.getElementById('DockPanel').getBoundingClientRect();
					
					if (e.clientY >= rect.bottom)
						return;
					
					// calculate new height
					rect = element.parent()[0].getBoundingClientRect();
					var diff = e.clientY - rect.top;
					
					element.parent().css('height', diff + 'px');
				};
				
				document.body.onmouseup = function() {
					// remove listeners
					document.body.onmousemove = null;
					document.body.onmouseup = null;
				};
			});
		}
	};
});