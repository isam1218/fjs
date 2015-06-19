hudweb.directive('contactSearch', ['$rootScope', '$document', 'ContactService', function($rootScope, $document, contactService) {
	var contacts = [];

	contactService.getContacts().then(function(data) {
		contacts = data;
	});
	
	return {
		restrict: 'A',
		link: function(scope, element, attrs) {
	
			var rect = element[0].getBoundingClientRect();			
			element.css('position', 'relative');
			element.css('width', '100%');
			element.css('z-index', 100);

			if ($(element).closest('.LeftBar').length > 0)
				element.css('width', '95%');
				
			// create overlay elements
			var overlay = angular.element('<div class="SearchContactOverlay"></div>');
			//overlay.css('width', rect.width + 'px');
			
			var inset = angular.element('<div class="Inset"></div>');
			inset.css('margin-top', rect.height*1.5 + 'px');
			
			var headerTitle = angular.element('<div class="Header">Add a Team Member</div>');

			if (attrs.conference == "true"){
				headerTitle = angular.element('<div class="Header">Join to conference</div>')
			}

			// search input
			element.bind('keyup', function() {
				overlay.remove();
				inset.empty();
				
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
					
					// add some paddin'
					if (element.prop('offsetWidth') == overlay.prop('offsetWidth')) {
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
			
			// fill row content
			function makeLine(contact) {
				var line = angular.element('<div class="ListRow"></div>');
				
				line.append('<div class="Avatar AvatarSmall"><img src="' + contact.getAvatar(14) + '" onerror="this.src=\'img/Generic-Avatar-14.png\'" /></div>');
				
				line.append('<div class="ListRowContent"><div class="Name">' + contact.displayName + '</div><div class="Extension">#' + contact.primaryExtension + '</div></div>');
				
				// send contact to parent scope
				line.bind('click', function() {
					scope.searchContact(contact);
					element.val('');
					overlay.remove();
				});
				
				return line;
			}
			
			scope.$on('$destroy', function() {
				$document.unbind('click');
				inset.remove();
				overlay.unbind().remove();
			});
		}
	};
}]);