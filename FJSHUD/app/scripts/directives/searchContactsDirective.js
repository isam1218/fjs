hudweb.directive('contactSearch', ['$rootScope', '$document', 'ContactService', function($rootScope, $document, contactService) {
	var contacts = [];

	contactService.getContacts().then(function(data) {
		contacts = data;
	});
	
	return {
		restrict: 'A',
		link: function(scope, element, attrs) {
			var overlay, inset, headerTitle;
			var added = false;
			var rect = element[0].getBoundingClientRect();
			
			element.css('position', 'relative');
			element.css('z-index', 100);
				
			// create overlay elements
			overlay = angular.element('<div class="SearchContactOverlay"></div>');
			
			inset = angular.element('<div class="Inset"></div>');
			inset.css('margin-top', rect.height*1.5 + 'px');

			if (attrs.conference == "true")
				headerTitle = angular.element('<div class="Header">Join to Conference</div>');
			else
				headerTitle = angular.element('<div class="Header">Add a Team Member</div>');

			// search input
			element.bind('keyup', function() {
				if (added) {
					inset.empty();
					overlay.remove();
				}
				
				if (element.val().length > 0) {
					inset.append(headerTitle);
					
					// look for match
					for (var c = 0, len = contacts.length; c < len; c++) {
						if (contacts[c].xpid != $rootScope.myPid && contacts[c].primaryExtension && contacts[c].displayName !== undefined && contacts[c].displayName.search(new RegExp(element.val(), 'i')) != -1 || contacts[c].primaryExtension.search(new RegExp(element.val(), 'i')) != -1) {
							// add to div
							var line = makeLine(contacts[c]);
							inset.append(line);
						}
					}
					
					overlay.append(inset);
					element.after(overlay);
					
					if (!added)
						overlayProperties();
				}
			});
			
			element.bind('click', function(e) {
				e.stopPropagation();
			});
			
			// clear search
			element.bind('search', function(e) {
				if (element.val().length == 0) {
					inset.empty();
					overlay.remove();
				}
			});
			
			// create overlay properties one-time
			function overlayProperties() {
				// add some paddin'
				if (element.prop('offsetWidth') == overlay.prop('offsetWidth') || element.prop('offsetLeft') == overlay.prop('offsetLeft')) {
					overlay.css('left', '-10px');
					overlay.css('width', overlay.prop('offsetWidth') + 20 + 'px');
				}
				
				if (element.prop('offsetTop') == overlay.prop('offsetTop'))
					overlay.css('top', '-10px');
			
				// prevent accidental closing
				overlay.bind('click', function(e) {
					e.stopPropagation();
				});
			
				// close overlay for reals
				$document.bind('click', function(e) {
					element.val('');
					overlay.remove();
				});
				
				added = true;
			}
			
			// fill row content
			function makeLine(contact) {
				var line = angular.element('<div class="ListRow"></div>');
				
				line.append('<div class="Avatar AvatarSmall"><img src="' + contact.getAvatar(14) + '" onerror="this.src=\'img/Generic-Avatar-14.png\'" /></div>');
				
				line.append('<div class="ListRowContent"><div class="Name">' + contact.displayName + '</div><div class="Extension">#' + contact.primaryExtension + '</div></div>');
				
				// send contact to parent scope
				line.bind('click', function() {
					scope.searchContact(contact);
					element.val('');
					inset.empty();
					overlay.remove();
				});
				
				line.on('$destroy', function() {
					line.empty().unbind('click');
				});
				
				return line;
			}
			
			scope.$on('$destroy', function() {
				$document.unbind('click');
				inset.empty();
				overlay.unbind().remove();
			});
		}
	};
}]);