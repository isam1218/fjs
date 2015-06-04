hudweb.directive('input', function() {
	return {
		restrict: 'E',
		link: function(scope, element, attrs) {
			// only for searchboxes and firefoxes
			if (attrs.type == 'search' && navigator.userAgent.indexOf('Firefox') != -1) {
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
		}			
	};	
});