hudweb.controller('ContextMenuController', ['$scope', function($scope) {
	$scope.$on('contextMenu', function(event, data) {
		$scope.contact = data;
		$scope.$safeApply();
	});
}]);