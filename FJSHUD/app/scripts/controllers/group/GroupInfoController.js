hudweb.controller('GroupInfoController', ['$scope', '$routeParams', '$rootScope', 'GroupService', function($scope, $routeParams, $rootScope, groupService) {

  // Save to rootScope so groupEditOverlay can access the id
  $rootScope.groupInfoId = $routeParams.groupId;
  
  $scope.userIsOwner = false;

  //var curGroup = groupService.getGroupById($rootScope.groupInfoId);
  groupService.getGroup().then(function(data) {
	  curGroup =  data;
  });
  if ($rootScope.myPid === curGroup.ownerId)
    $scope.userIsOwner = true;

  $scope.setEdit = function(){
    $rootScope.groupEdit = true;
  };

}]);