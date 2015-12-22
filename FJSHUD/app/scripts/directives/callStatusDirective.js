hudweb.directive('callstatus', ['$parse','$compile', '$location', 'NtpService','ConferenceService', 
	function($parse,$compile, $location, ntpService,conferenceService) {
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
					innerElement = "<avatar ng-click='showCallOverlay(callstatusContact)' context='callstatus' profile='callstatusContact.call.fullProfile' type=" + contact.call.type + "> </avatar> <div class='CallLineTop'> <div class='CallerName'>" + contact.call.displayName + "</div> <div class='CallExtension'>" + contact.call.phone + "</div> </div> <div class='CallDuration' timer=" + contact.call.startedAt + "> </div>";
					element.append(innerElement);
				}else{
					innerElement = '<div class="NoCallText">' + scope.verbage.no_active_call + '</div> <div class="NoCallIcon"> </div>';
					element.append(innerElement);
				}
				$compile(element.contents())(scope);
			}

			scope.showCallOverlay = function(contact){
						
				if (contact.call.contactId == scope.meModel.my_pid)
					return;

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
			};

			scope.$watch("contact.call",function(){
				updateContact(contact);
			});
			

			scope.$on("$destroy", function () {
				//$interval.cancel(loop);
				
			});
		}
	};
}]);
