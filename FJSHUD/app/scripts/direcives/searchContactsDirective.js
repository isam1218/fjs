fjs.core.namespace("fjs.directive");
fjs.directive.ContactSearch = function($document) {
	return {
		restrict: 'A',
		controller: 'ContactsWidget', // re-use contact controller
		link: function(scope, element, attrs) {
			var rect = element[0].getBoundingClientRect();
			element.css('z-index', 100);
			
			// create overlay elements
			var overlay = angular.element('<div class="SearchContactOverlay"></div>');
			overlay.css('width', rect.width + 'px');
			
			var inset = angular.element('<div class="Inset"></div>');
			inset.css('margin-top', rect.height*1.5 + 'px');
		
			// search input
			element.bind('keyup', function() {
				overlay.remove();
				inset.empty();
				
				if (element.val().length > 0) {
					// look for match
					for (c in scope.contacts) {
						if (scope.contacts[c].displayName !== undefined && scope.contacts[c].displayName.search(new RegExp(element.val(), 'i')) != -1) {
							// add to div
							var line = makeLine(scope.contacts[c]);
							inset.append(line);
						}
					}
					
					overlay.append(inset);
					element.after(overlay);
			
					// prevent accidental closing
					overlay.bind('click', function(e) {
						e.stopPropagation();
					});
				}
			});
			
			element.bind('click', function(e) {
				e.stopPropagation();
			});
			
			// clear search
			element.bind('search', function(e) {
				if (element.val().length == 0)
					overlay.remove();
			});
			
			// close overlay
			$document.bind('click', function(e) {
				element.val('');
				overlay.remove();
			});
			
			// fill row content
			function makeLine(contact) {
				var line = angular.element('<div class="ListRow"></div>');
				
				line.append('<div class="Avatar AvatarSmall"><img src="' + scope.getAvatarUrl(contact.xpid, 14) + '" onerror="this.src=\'img/Generic-Avatar-14.png\'" /></div>');
				
				line.append('<div class="ListRowContent"><div class="Name">' + contact.displayName + '</div><div class="Extension">#' + contact.primaryExtension + '</div></div>');
				
				return line;
			}
		}
	};
};