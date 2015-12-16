hudweb.directive('contactSearch', ['$rootScope', '$document', '$compile', 'ContactService', function($rootScope, $document, $compile, contactService) {
	var contacts = [];
	
	contactService.getContacts().then(function(data) {
		contacts = data;
		
		contacts.sort(function(a, b) {
			var nameA = a.username.toLowerCase();
			var nameB = b.username.toLowerCase();
			
			if (nameA < nameB)
				return -1;
			else if (nameA > nameB)
				return 1;
			else
				return 0;
		});
	});
	
	// used as contact-search="range|destination"
	// parent controller will need a function called searchContact() for onclick action
	// size of pop-up should be controlled in stylesheets
	return {
		restrict: 'A',
		link: function(scope, element, attrs) {
			var overlay, inset, rows, joinBtn;
			var range = attrs.contactSearch.split('|')[0];
			var destination;
			var isArray = false;
			
			element.bind('click', function(e) {
				if (overlay)
					e.stopPropagation();
			});
			
			element.bind('search', function(e) {
				if (overlay && element.val().length == 0)
					removeOverlay();
			});
			
			element.bind('keyup', function(e) {
				// add overlay for the first time
				if (!overlay && element.val().length > 0) {
					overlay = angular.element('<div class="SearchContactOverlay"></div>');
					overlay.css('top', element[0].offsetTop - 50 + 'px');
					
					// conferences are a special case
					if (scope.conference) {
						overlay.append('<div class="SearchHeader">Join to Conference</div>');
						
						joinBtn = angular.element('<input type="button" class="XButton XButtonNormal JoinByPhoneBtn" id="joinConfButton" value="Join by phone" />');
						
						joinBtn.bind('click', function() {
							scope.searchContact(null, element.val());
							removeOverlay();
						});
						
						overlay.append(joinBtn);
						overlay.append('<div class="ExpandedToolBarHelp">Click on contact to join</div>');
					}
					else
						overlay.append('<div class="SearchHeader">Add a Team Member</div>');
					
					inset = angular.element('<div class="Inset"></div>');	
					inset.css('margin-top', element[0].offsetHeight*1.6 + 'px');
					
					rows = angular.element('<div class="rows"></div>');
					
					inset.append(rows);
					overlay.append(inset);
					
					element.after(overlay);
			
					// prevent accidental closing
					overlay.bind('click', function(e) {
						e.stopPropagation();
					});
			
					// close overlay for reals
					$document.bind('click', function(e) {
						removeOverlay();
					});
					
					// find object/array that we will add contacts to
					destination = scope.$eval(attrs.contactSearch.split('|')[1]);
			
					if (Array.isArray(destination))
						isArray = true;
				}
				// clear
				else if (element.val().length == 0) {
					removeOverlay();
					return;
				}
				
				// populate
				var query = element.val().toLowerCase();
				var count = 0;
				rows.empty();
				
				for (var i = 0, len = contacts.length; i < len; i++) {
					var contact = contacts[i];
					var dupe = false;
					
					// basic check
					if (contact.xpid != $rootScope.myPid && (range == 'all' || contact.primaryExtension)) {
						// dupe check
						if (isArray) {
							for (var j = 0, jLen = destination.length; j < jLen; j++) {
								if (destination[j].xpid == contacts[i].xpid || (destination[j].fullProfile && destination[j].fullProfile.xpid == contacts[i].xpid)) {
									dupe = true;
									break;
								}
							}
						}
						else {
							for (var key in destination) {
								if (key == contacts[i].xpid) {
									dupe = true;
									break;
								}
							}
						}
						
						if (dupe) continue;
						
						// final query check
						if (contact.displayName.toLowerCase().indexOf(query) != -1 || contact.primaryExtension.indexOf(query) != -1 || contact.phoneMobile.indexOf(query) != -1 || contact.primaryExtension.replace(/\D/g,'').indexOf(query) != -1 || contact.phoneMobile.replace(/\D/g,'').indexOf(query) != -1) {
							count++;
							makeLine(contact);
						}
					}
				}
				
				// conferences only
				if (scope.conference) {
					// add unknown row
					if (count == 0)
						makeLine(null);
					
					if (!isNaN(element.val()))
						joinBtn.attr('disabled', false);
					else
						joinBtn.attr('disabled', true);
				}
			});
			
			scope.$on('$destroy', function() {
				removeOverlay();
			});
			
			// fill row content
			function makeLine(contact) {
				var line = angular.element('<div Class="ListRow"></div>');
				var content = '';
				
				// valid contact
				if (contact) {
					scope.contact = contact;
					
					line.append($compile('<avatar profile="contact" context="drag"></avatar>')(scope));
					
					content = '<div class="ListRowContent"><div class="ListRowTitle"><div class="name">' + contact.displayName + '</div><div class="hudStatus"><div class="ListRowStatusIcon XIcon-ChatStatus-'+ contact.hud_status +'"></div>' + (contact.custom_status ? contact.custom_status : contact.hud_status ? contact.hud_status : 'offline');

					if (contact.call)
						content += ' + on call';

					content += '</div></div>';
					
					if (contact.primaryExtension)
						content += '<div class="ListRowStatus"><div class="Extension">#' + contact.primaryExtension + '</div></div>';
					
					content += '</div>';
				}
				// unknown
				else {
					line.append('<div class="Avatar AvatarSmall"><img src="img/Generic-Avatar-14.png"/></div>');	
					
					content = '<div class="ListRowContent"><div class="ListRowTitle"><div class="name"><strong>Unknown number</strong></div>';

					if (!isNaN(element.val())) {
						content += '<div>' + element.val() + '</div></div><div class="ListRowStatus"><div class="XButton XButtonNormal JoinByPhoneBtnSecond"><span>Join by phone</span></div></div>';
					}	
					else
						content += '<div>Please enter a valid number</div>';
					
					content += '</div>';
				}
				
				line.append(content);
				
				line.bind('click', function(e) {
					if (contact || !isNaN(element.val())) {
						// send back to parent controller
						scope.searchContact(contact, element.val());
						removeOverlay();
					}
				});
				
				line.on('$destroy', function() {
					// clean up
					line.unbind('click');
					line = null;
				});
				
				rows.append(line);
			}
			
			// destroy
			function removeOverlay() {
				if (overlay) {
					$document.unbind('click');
					
					element.val('');
					
					rows = null;
					inset = null;
					
					if (joinBtn) {
						joinBtn.unbind();
						joinBtn = null;
					}
					
					overlay.unbind().remove();
					overlay = null;
				}
			}
		}
	};
}]);