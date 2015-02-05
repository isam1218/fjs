hudweb.controller('ContextMenuController', ['$rootScope', '$scope', 'ContactService', 'GroupService', 'HttpService', function($rootScope, $scope, contactService, groupService, httpService) {
	// populate contact info from directive
	$scope.$on('contextMenu', function(event, data) {
		// is a group
		if (data.members) {
			$scope.group = data;
			$scope.contact = null;
			$scope.isMine = groupService.isMine(data.xpid);
		}
		else {
			$scope.contact = data;
			$scope.group = null;
			$scope.isFavorite = groupService.isFavorite(data.xpid);
		}
		
		$scope.$safeApply();
	});
	
	// send to contacts widget
	$scope.editContact = function() {
		$rootScope.$broadcast('editContact', $scope.contact);
	};
	
	$scope.editGroup = function() {
		$rootScope.$broadcast('editGroup', $scope.group);
	};
	
	$scope.removeFavorite = function() {
		httpService.sendAction('groupcontacts', 'removeContactsFromFavorites', {contactIds: $scope.contact.xpid});
	};
	
	$scope.makeCall = function(number) {
		httpService.sendAction('me', 'callTo', {phoneNumber: number});
	};
	
	$scope.sendGroupMail = function() {
		var emails = [];
		
		angular.forEach($scope.group.members, function(obj) {
			var contact = contactService.getContact(obj.contactId);
			
			if (contact.email)
				emails.push(contact.email);
		});
		
		window.open('mailto:' + emails.join(';'));
	};
}]);