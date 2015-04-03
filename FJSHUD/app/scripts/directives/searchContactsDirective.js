hudweb.directive('contactSearch', ['$document', 'ContactService', function($document, contactService) {
	return {
		restrict: 'A',
		link: function(scope, element, attrs) {
			var contacts = [];

			// pull updates from service
			contactService.getContacts().then(function(data) {
				contacts = data;
			});
			
			scope.$on('contacts_updated', function(event, data) {
				contacts = data;
			});
	
			var rect = element[0].getBoundingClientRect();			
			element.css('position', 'relative');
			if($(element).closest('.ConferenceMembers').length > 0)
				element.css('width', '100%');
			else
			{
				element.css('z-index', 100);
				if(navigator.userAgent.indexOf('Firefox') != -1)
				{
					element.css('max-width', '20em');
					element.css('min-width', '17.5em');
				}	
				else
				{	
					element.css('width', '19.5em');
				}
			}
				
			// create overlay elements
			var overlay = angular.element('<div class="SearchContactOverlay"></div>');
			//overlay.css('width', rect.width + 'px');
			
			var inset = angular.element('<div class="Inset"></div>');
			inset.css('margin-top', rect.height*1.5 + 'px');
			
			var headerTitle = angular.element('<div class="Header">Add a Team Member</div>');

			var note = angular.element('<div></div>');
			if(attrs.conference =="true"){
				headerTitle = angular.element('<div class="Header">Join to conference</div>')
				if($(element).closest('.ConferenceMembers').length > 0)
				{	
					overlay.css('width','450%');					
				}	
				else
					overlay.css('width','300%');
			}

			// search input
			element.bind('keyup', function() {
				overlay.remove();
				inset.empty();
				
				if (element.val().length > 0) {
					inset.append(headerTitle);
					
					// look for match
					for (c in contacts) {
						if (contacts[c].primaryExtension && contacts[c].displayName !== undefined && contacts[c].displayName.search(new RegExp(element.val(), 'i')) != -1 || contacts[c].primaryExtension.search(new RegExp(element.val(), 'i')) != -1) {
							// add to div
							var line = makeLine(contacts[c]);
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
				
				line.append('<div class="Avatar AvatarSmall"><img src="' + contact.getAvatar(14) + '" onerror="this.src=\'img/Generic-Avatar-14.png\'" /></div>');
				
				line.append('<div class="ListRowContent"><div class="Name">' + contact.displayName + '</div><div class="Extension">#' + contact.primaryExtension + '</div></div>');
				//line.append('<input style="float:right" class="vmcallbtn" type="button" value="Call" ng-click="callExtension('+contact.primaryExtension+')"></input>');
				// send contact to parent scope
				line.bind('click', function() {
					scope.searchContact(contact);
					element.val('');
					overlay.remove();
				});
				
				return line;
			}
		}
	};
}]);