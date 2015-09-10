hudweb.directive('input', ['SettingsService', '$timeout', function(settingsService, $timeout) {
	// browser detection
	var browser = navigator.userAgent.match(/(chrome|safari|firefox|msie)/i);
	browser = browser && browser[0] ? browser[0] : "MSIE";
	
	// auto clear settings
	var autoClearOn, autoClearTime;
	
	settingsService.getSettings().then(function(data) {
		autoClearOn = data.hudmw_searchautoclear;
		autoClearTime = data.hudmw_searchautocleardelay;
	});
	
	return {
		restrict: 'E',
		link: function(scope, element, attrs) {
			// search only
			if (attrs.type != 'search') return;
			
			var timeout;
			
			// trigger auto clear
			if (scope.enableChat === undefined && scope.searchEmUp === undefined) {
				element.on('keyup', function(e) {
					if (autoClearOn == 'true') {
						$timeout.cancel(timeout);
						
						timeout = $timeout(clearSearch, autoClearTime*1000);
					}
				});
			
				// pull updated settings
				scope.$on('settings_updated', function(event, data) {
					autoClearOn = data.hudmw_searchautoclear;
					autoClearTime = data.hudmw_searchautocleardelay;
				});
			}
			
			// firefox doesn't have a clear button
			if (browser == 'Firefox') {
				var xImg;
				
				element.on('keydown mouseenter', function(e) {
					if (element.val() != '') {
						// create x for first time
						if ($(element).parent().find('.x').length == 0) {
							 xImg = angular.element('<img class="x" src="img/clear.png"/>');
				            if($(element).closest('#WidgetSearch').length > 0)
				            	xImg.css('top', (element[0].offsetTop - 3) + 'px');
				            else
				            	xImg.css('top', element[0].offsetTop + 'px');
							xImg.css('left', element[0].offsetLeft + element[0].offsetWidth + 'px');
				
							// clear on click
							xImg.bind('click', function(e) {
								e.stopPropagation();
								
								$(this).hide();
								
								clearSearch();
							});	
				
							$(element).parent().append(xImg);
						}
						else
							$(element).parent().find('.x').show();
					}
					else
						$(element).parent().find('.x').hide();
				});
				
				element.on('mouseleave', function(e) {
					if (e.relatedTarget && e.relatedTarget.className != 'x')
						$(element).parent().find('.x').hide();
				});
			}
			
			// IE clear is broken
			if (browser == 'MSIE') {
				element.bind('input', function() {
					if (element.val().length == 0) {
						clearSearch();
				});
			}
			
			scope.$on('$destroy', function() {
				$timeout.cancel(timeout);
				
				if (xImg !== undefined)
					xImg.unbind().remove();
			});
			
			function clearSearch() {
				if (attrs.ngModel) {
					scope.$evalAsync(function() {
						scope.$eval(attrs.ngModel + ' = "";');
					});
				}
				else
					element.val('');
				
				// contact overlay?
				if (attrs.contactSearch !== undefined)
					$(element).trigger('search');
			}
		}			
	};	
}]);