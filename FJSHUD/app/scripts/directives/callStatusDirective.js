hudweb.directive('callstatus', ['$parse','$compile', '$interval', 'NtpService', function($parse,$compile, $interval, ntpService) {
	return {
		restrict: 'E',
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
				if(contact.call){
					avatarEle = angular.element("<avatar ng-click='showCallOverlay(contact)' profile=" + contact.call.fullProfile + " type=" + contact.call.type + "> </avatar>");
					details = angular.element("<div class='CallLineTop'></div>");
					detailCallerName = angular.element("<div class='CallerName'>" + contact.call.displayName + "</div>");
					detailCallExtension = angular.element("<div class='CallExtension'>" + contact.call.phone + "</div>");
					duration = angular.element("<div class='CallDuration' timer=" + contact.call.startedAt + "> </div>");
					details.append(detailCallerName);
					details.append(detailCallExtension); 
					avatarEle.css('height','40px');
					avatarEle.css('width', '40px');
					
					element.append(avatarEle);
					element.append(details);
					element.append(duration);
					
				}else{
					details = angular.element('<div class="NoCallText">' + scope.verbage.no_active_call + "</div>");
					detailCallerName = angular.element('<div class="NoCallIcon"> </div>');
					element.append(details);
					element.append(detailCallerName);
				}

				if(avatarEle){
					avatarEle.bind('click',function(){
						$event.stopPropagation();
				        $event.preventDefault();
						
						if (contact.call.contactId == scope.meModel.my_pid)
							return;
					
						scope.showOverlay(true, 'CallStatusOverlay', contact);
					});
				}
				$compile(element.contents())(scope);
			}

			scope.showCallOverlay = function(contact){
						
				if (contact.call.contactId == scope.meModel.my_pid)
					return;
					
				scope.showOverlay(true, 'CallStatusOverlay', contact);
				
			}

			scope.$watch("contact.call",function(){
				updateContact(contact);
			});
			

			scope.$on("$destroy", function () {
				//$interval.cancel(loop);
				
			});
		}
	};
}]);
