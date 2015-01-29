hudweb.controller('QueueWidgetStatsController', ['$scope', '$routeParams', '$timeout', '$filter', function($scope, $routeParams, $timeout, $filter) {
  $scope.context = this;
  $scope.queueId = $routeParams.queueId;


  $scope.tabs = ['Agents', 'Stats', 'Calls', 'Call Log'];
  $scope.selected = 'Stats';

}]);