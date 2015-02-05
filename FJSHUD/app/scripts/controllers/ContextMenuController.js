hudweb.controller('ContextMenuController', ['$rootScope', '$scope', 'GroupService', 'HttpService', function($rootScope, $scope, groupService, httpService) {
	// populate contact info from directive
	$scope.$on('contextMenu', function(event, data) {
		$scope.contact = data;
		$scope.isFavorite = groupService.isFavorite(data.xpid);
		
		$scope.$safeApply();
	});
	
	// send to contacts widget
	$scope.editContact = function() {
		$rootScope.$broadcast('editContact', $scope.contact);
	};
	
	$scope.removeFavorite = function() {
		httpService.sendAction('groupcontacts', 'removeContactsFromFavorites', {contactIds: $scope.contact.xpid});
	};
}]);