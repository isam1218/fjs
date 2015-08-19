hudweb.directive('contactSearch', ['$rootScope', '$document', 'ContactService', function($rootScope, $document, contactService) {
	var contacts = [];
	var myExtension;

	contactService.getContacts().then(function(data) {
		for (var i = 0, iLen = data.length; i < iLen; i++){
			if ($rootScope.myPid == data[i].xpid){
				myExtension = data[i].primaryExtension;
				break;
			}
		}
		contacts = data;
	});
	
	return {
		restrict: 'A',
		link: function(scope, element, attrs) {
			var overlay, inset, headerTitle, rows;
			var added = false;
			var rect = element[0].getBoundingClientRect();
			
			element.css('position', 'relative');
			element.css('z-index', 100);
				
			// create overlay elements			
			inset = angular.element('<div class="Inset"></div>');
			inset.css('margin-top', rect.height*1.5 + 'px');
			
			var joinByPhoneBtn = angular.element('<div class="XButton XButtonNormal JoinByPhoneBtn" id="joinConfButton"><span>Join by phone</span></div>');
			var joinByPhoneBtnDisabled = angular.element('<div class="XButton XButtonNormal JoinByPhoneBtn" disabled="disabled" id="joinConfButton"><span>Join by phone</span></div>'); 
			
			var addTeamMemberHeader = function(conf){
				if (conf){
					overlay = angular.element('<div class="SearchContactOverlay conferenceSearch"></div>');
					headerTitle = angular.element('<div class="Header">Join to Conference</div>');
					overlay.append(headerTitle);
				} else {
					overlay = angular.element('<div class="SearchContactOverlay favoritesSearch"></div>');
					headerTitle = angular.element('<div class="Header">Add a Team Member</div>');
					inset.append(headerTitle);
				}
			};
			
			if (attrs.conference == 'true')
				addTeamMemberHeader(true);
			else
				addTeamMemberHeader(false);

			rows = angular.element('<div class="rows"></div>');

			// search input
			element.bind('keyup', function(e) {
				if (added) {
				   rows.empty();				   
				   overlay.remove();
				}

				// if user deletes search input, need to reset inset and create new rows div
				if (e.keyCode == 8 || e.keyCode == 46){
					inset.empty();
					if (attrs.conference != 'true'){
						addTeamMemberHeader(false);
					}
					rows = angular.element('<div class="rows"></div>');
				}
				
				if (element.val().length > 0) {
					var matchCount = 0;
					// look for match
					for (var c = 0, len = contacts.length; c < len; c++) {
						if (contacts[c].xpid != $rootScope.myPid && contacts[c].displayName !== undefined && contacts[c].displayName.search(new RegExp(element.val(), 'i')) != -1 || contacts[c].primaryExtension !== myExtension && contacts[c].primaryExtension.search(new RegExp(element.val(), 'i')) != -1 || contacts[c].phoneMobile.search(new RegExp(element.val(), 'i')) != -1 || contacts[c].phoneBusiness.search(new RegExp(element.val(), 'i')) != -1 ){
							var line = makeLine(contacts[c], false, c);
							rows.append(line);
							matchCount++;
						} 
					}

					if(matchCount == 0){
						var line = makeLine(null, true);
						inset.empty();
						rows.empty();

						if (attrs.conference != 'true'){
							addTeamMemberHeader(false);
						}
						rows = line;
					}

					headerTitle.remove();

					if (attrs.conference == 'true')
						addTeamMemberHeader(true);
					else
						addTeamMemberHeader(false);

					if (attrs.conference == "true" && matchCount == 0 & !isNaN(element.val())){
						addTeamMemberHeader(true);
						overlay.append(joinByPhoneBtn);
						overlay.append('<div class="ExpandedToolBarHelp">Click on contact to join</div>');
					} else if (attrs.conference == 'true' & matchCount == 0 & isNaN(element.val())){
						addTeamMemberHeader(true);
						overlay.append(joinByPhoneBtnDisabled);
						overlay.append('<div class="ExpandedToolBarHelp">Click on contact to join</div>');
					}

					inset.append(rows);
					overlay.append(inset);
					element.after(overlay);

					if(joinByPhoneBtn){
						joinByPhoneBtn.bind('click',function(){
							if (!isNaN(element.val())){
								scope.addExternalToConference(element.val());
								}	
						});
					}
					
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
					rows.empty();
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
					if(e.target != overlay)
					{	
						inset.empty();
						rows = angular.element('<div class="rows"></div>');
						element.val('');
						overlay.remove();
					}
				});
				
				added = true;
			}

			var fullContactInfo = function(line, contact){
				line.append('<div class="Avatar AvatarSmall"><img src="' + contact.getAvatar(14) + '" onerror="this.src=\'img/Generic-Avatar-14.png\'" /></div>');
				var hud_status = contact.hud_status || 'offline';
				var name = '<div class="ListRowContent"><div class="ListRowTitle AddTeamMember">';
				name += '<div class="name" style="font-size:12px">' + contact.displayName + '</div>';
				name += '<div class="hudStatus" style="font-size:10px"><div class="ListRowStatusIcon XIcon-ChatStatus-'+ hud_status +'"></div>';
				name +=	 contact.custom_status ? contact.custom_status : contact.hud_status ? contact.hud_status : 'offline';
				if(contact.call){
					name += " + on call";
				}
				name += '</div></div><div class="ListRowStatus"><div class="Extension Link">#' + contact.primaryExtension + '</div></div></div>';
				line.append(name);
			};

			// fill row content
			function makeLine(contact, joinByPhone, idx) {
				var line = angular.element('<div class="ListRow"></div>');
				
				// 1. conference - adding external #...
				// join by phone only applies to conferences
				if (joinByPhone && attrs.conference == "true"){
					line.append('<div class="Avatar AvatarSmall"><img src="img/Generic-Avatar-14.png"/></div>');				
					var name = '<div class="ListRowContent"><div class="ListRowTitle">';
					name += '<div class="name"><strong>Unknown number</strong></div>';

					if (!isNaN(element.val())){
						name += '<div class="">' + element.val() + '</div>';
						name += '</div><div class="ListRowStatus"><div class="XButton XButtonNormal JoinByPhoneBtnSecond"><span>Join by phone</span></div></div></div>';
					}	else
						name += '<div class="">Please enter a valid number</div>';

					line.append(name);
				} else {
					// 2. conference adding internal contact...
					if (attrs.conference == "true")
					{
						var confMemAdded = false;
						for (var i = 0, iLen = scope.conference.members.length; i < iLen; i++){
							var singleMember = scope.conference.members[i].fullProfile.xpid;
							if (contact && contact.xpid){
								if (contact.xpid == singleMember)
									confMemAdded = true;
							}
						}
						if (contact && !confMemAdded)
							var name = fullContactInfo(line, contact);
						else
							line = angular.element('');
					}	
					else{
						// 3. favorites...
						if (attrs.ngController == "ContactsWidget"){
							var faveAdded = false;
							for (var key in scope.favorites){
								if (contact && contact.xpid){
									if (contact.xpid == key){
										faveAdded = true;
									}									
								}
							}
							if (contact && !faveAdded)
								fullContactInfo(line, contact);
							else
								line = angular.element('');
							// 4. group edit...
						} else if (attrs.id == 'SearchContactDirectiveMarker'){
							var groupMemberAdded = false;
							for (var i = 0; i < scope.add.contacts.length; i++){
								if (contact && contact.xpid){
									if (contact.xpid == scope.add.contacts[i].xpid)
										groupMemberAdded = true;									
								}
							}
							if (contact && !groupMemberAdded)
								var name = fullContactInfo(line, contact);
							else
								line = angular.element('');
						} else {
							// 5. zoom adding contact, but take into account if contact already added or deleted from added list...
							var contactAdded = false;
							for (var i = 0, iLen = scope.addedContacts.length; i < iLen; i++){
								if (contact && contact.xpid){
									if (contact.xpid == scope.addedContacts[i].xpid)
										contactAdded = true;
								}
							}
							if (contact && !contactAdded)
								var name = fullContactInfo(line, contact);
							else
								line = angular.element('');
						}
					}

				}

				// send contact to parent scope
				line.bind('click', function() {
					// if adding members to a conference...
					if (attrs.conference == 'true'){
						// if adding an internal contact
						if (contact){
							// need both of these checks otherwise error results when adding an external #
							if (contact.xpid){
								// searchContact is used to add an internal contact
								scope.searchContact(contact);
							}
						} else if (!isNaN(element.val())){
							// otherwise if adding an external phone #...
							scope.addExternalToConference(element.val());
							// addExternalToConference is used to add external number
						}
					// if adding to zoom or favorites
					} else {
						scope.searchContact(contact);
					}

					element.val('');
					rows.empty();					
					overlay.remove();
				});
				
				line.on('$destroy', function() {
					line.empty().unbind('click');
				});
				
				return line;
			}
			
			
			scope.$on('$destroy', function() {
				$document.unbind('click');
				rows.empty();				
				overlay.unbind().remove();
			});
		}
	};
}]);