hudweb.directive('input', function() {
	var browser = navigator.userAgent.match(/(chrome|safari|firefox|msie)/i);
	browser = browser && browser[0] ? browser[0] : "MSIE";
	
	return {
		restrict: 'E',
		link: function(scope, element, attrs) {
			// search only
			if (attrs.type != 'search')
				return;
			
			// firefox doesn't have a clear button
			if (browser == 'Firefox') {
				var xImg = angular.element('<img class="x" src="img/clear.png"/>');
				
				xImg.bind('click', function(e) {
					e.stopPropagation();
					
					$(this).hide();
					
					scope.$evalAsync(function() {
						scope.$eval(attrs.ngModel + ' = "";');
					});
				});	
				
				element.on('keyup change mouseover mouseenter', function(e) {
					if (element.val() != '') {
						if ($(element).parent().find('.x').length == 0) {
							if ($(element).closest('.ConferenceMembers').length > 0)
								element.parent().append(xImg);
							else
								element.after(xImg);
						}
						else
							$(element).parent().find('.x').show();
					}
					else
						$(element).parent().find('.x').hide();
				});
				
				element.on('mouseleave', function(e) {
					if (e.relatedTarget.className != 'x')
						$(element).parent().find('.x').hide();
				});
				
				scope.$on('$destroy', function() {
					xImg.unbind().remove();
				});
			}
			// IE clear is broken
			else if (browser == 'MSIE') {
				element.bind('input', function() {
					if (element.val().length == 0) {
						scope.$evalAsync(function() {
							scope.$eval(attrs.ngModel + ' = "";');
						});
					}
				});
			}
		}			
	};	
});