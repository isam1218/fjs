hudweb.directive('autoFocus', ['$timeout', '$routeParams', 'StorageService', function($timeout, $routeParams, storageService) {
    return {
        restrict: 'A',
        link: function(scope, element) {

            var targetId;

            if ($routeParams.contactId)
                targetId = $routeParams.contactId;
            else if ($routeParams.conferenceId)
                targetId = $routeParams.conferenceId;
            else if ($routeParams.groupId)
                targetId = $routeParams.groupId;
            else if ($routeParams.queueId)
                targetId = $routeParams.queueId;      

            var savedMsg = storageService.getChatMessage(targetId);

            var timer = $timeout(function(){
                element[0].focus();
                element[0].value = '';
                element[0].value = savedMsg;
            }, 10);

            scope.$on('$destroy', function() {
                $timeout.cancel(timer);
            });
        }
    };
}]);