hudweb.directive('callstatus', ['$parse','$compile', '$location', 'NtpService','ConferenceService', 'ContactService', 'CallStatusService',
	function($parse,$compile, $location, ntpService,conferenceService, contactService, callStatusService) {
	return {
		restrict: 'E',
		priority: -1,
		replace: true,
		/*scope: {
			timer: '=timer'
		},*/
		template:'<div class="WidgetHeaderCallStatus"></div>',
		link: function(scope, element, attrs) {

			var callStatus,avatarEle,details,detailCallerName, detailCallExtension,duration;
			var contact = $parse(attrs.profile)(scope);




			function updateContact(contact){
				element.empty();
				//we create a call status contact and attach it to the scope
				scope.callstatusContact = contact;
				if(contact.call){
					var regStr = /^(9-|91-|1-)/;	
					var innerElement = "<avatar ng-click='showCallOverlay(callstatusContact)' context='callstatus' profile='callstatusContact.call.fullProfile' type=" + contact.call.type + "> </avatar> <div class='CallLineTop'> <div class='CallerName'>" + contact.call.displayName.replace(regStr, '') + "</div> <div class='CallExtension'>" + contact.call.phone + "</div> </div> <div class='CallDuration' timer=" + contact.call.startedAt + "> </div>";
					element.append(innerElement);
				}else{
					var innerElement = '<div class="NoCallText">' + scope.verbage.no_active_call + '</div> <div class="NoCallIcon"> </div>';
					element.append(innerElement);
				}
				$compile(element.contents())(scope);
			}

			scope.showCallOverlay = function(contact){
				// if this service-function returns true -> it's a trap! User is trying to click on own cso so do not show
				if (callStatusService.blockOverlay(contact)){
					return;
				} else {
					// otherwise -> display...
					switch(contact.call.type){
						case fjs.CONFIG.CALL_TYPES.CONFERENCE_CALL:
							var conference = conferenceService.getConference(contact.call.details.conferenceId);
							if(conference && conference.permissions == 0){
								$location.path('/conference/'+ contact.call.details.conferenceId);
							}
							break;
						default:
							scope.showOverlay(true, 'CallStatusOverlay', contact);
					}

				}
			};

			element.on('click', function(event){
				event.stopPropagation();
				event.preventDefault();
			});

			scope.$watch("contact.call",function(){
				updateContact(contact);
			});

			if(scope.profile){
				scope.$on("contextMenu", function () {
					contact = $parse(attrs.profile)(scope);
					updateContact(contact);

				});
			}

		}
	};
}]);
