hudweb.directive('contactSearch', ['$rootScope', '$document', 'ContactService', function($rootScope, $document, contactService) {
	var contacts = [];

	contactService.getContacts().then(function(data) {
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
			if (attrs.conference == "true"){
				overlay = angular.element('<div class="SearchContactOverlay conferenceSearch"></div>');
				headerTitle = angular.element('<div class="Header">Join to Conference</div>');
				overlay.append(headerTitle);
				overlay.append(joinByPhoneBtn);
				overlay.append('<div class="ExpandedToolBarHelp">Click on contact to join</div>');
			} else {
				overlay = angular.element('<div class="SearchContactOverlay favoritesSearch"></div>');
				headerTitle = angular.element('<div class="Header">Add a Team Member</div>');
				inset.append(headerTitle);
			}

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
					rows = angular.element('<div class="rows"></div>');
				}
				
				if (element.val().length > 0) {
					var matchCount = 0;
					// look for match
					for (var c = 0, len = contacts.length; c < len; c++) {
						if (contacts[c].xpid != $rootScope.myPid && contacts[c].displayName !== undefined && contacts[c].displayName.search(new RegExp(element.val(), 'i')) != -1 || contacts[c].primaryExtension.search(new RegExp(element.val(), 'i')) != -1 || contacts[c].phoneMobile.search(new RegExp(element.val(), 'i')) != -1 || contacts[c].phoneBusiness.search(new RegExp(element.val(), 'i')) != -1 ){
							var line = makeLine(contacts[c], false);
							rows.append(line);
							matchCount ++;
						} 
					}

					if(matchCount == 0){
						var line = makeLine(null, true);
						inset.empty();
						rows.empty();
						rows = line;
					}
					
					inset.append(rows);
					overlay.append(inset);
					element.after(overlay);

					if(joinByPhoneBtn){
					joinByPhoneBtn.bind('click',function(){
						if (!isNaN(element.val())){
							scope.addToConference(element.val());
							}	
						})
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
					//rows.empty();
					//inset.empty();
					//overlay.remove();
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
			
			// fill row content
			function makeLine(contact, joinByPhone) {
				var line = angular.element('<div class="ListRow"></div>');
				
				if (joinByPhone){
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
					line.append('<div class="Avatar AvatarSmall"><img src="' + contact.getAvatar(14) + '" onerror="this.src=\'img/Generic-Avatar-14.png\'" /></div>');				
					
					//add the chat status if the search is done for conference
					if (attrs.conference == "true")
					{
						var hud_status = contact.hud_status || 'offline';
						var name = '<div class="ListRowContent"><div class="ListRowTitle">';
						name += '<div class="name"><strong>' + contact.displayName + '</strong></div>';
						name += '<div class="hudStatus"><div class="ListRowStatusIcon XIcon-ChatStatus-'+ hud_status +'"></div>';
						name +=	 contact.custom_status ? contact.custom_status : contact.hud_status ? contact.hud_status : 'offline';
						name += '</div></div><div class="ListRowStatus"><div class="Extension Link">#' + contact.primaryExtension + '</div></div></div>';
						line.append(name);
					}	
					else
						line.append('<div class="ListRowContent"><div class="Name">' + contact.displayName + '</div><div class="Extension">#' + contact.primaryExtension + '</div></div>');

				}

				// send contact to parent scope
				line.bind('click', function() {
					if(contact){
						if(contact.primaryExtension){
							scope.searchContact(contact);
						}else{
							if(contact.phoneMobile){
								scope.addToConference(contact.phoneMobile);	
							}else{
								scope.addToConference(contact.phoneBusiness);
							}
						}
					}else if (!isNaN(element.val())){
						scope.addToConference(element.val());
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