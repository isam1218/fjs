hudweb.directive('watchWindowResize', ['$window', '$timeout', 'windowDimensions', 
function( $window, $timeout, windowDimensions ) {

    return {
        link: function( $scope ) {
            // Get window's dimensions
            $scope.getDimensions = function() {                
                $scope.$broadcast('watchWindowResize::resize', {
                    height: windowDimensions.height(),
                    width : windowDimensions.width()
                });
            };
            
            // On window resize...
            angular.element($window).on('resize', function( e ) {
                
                // Reset timeout
                $timeout.cancel($scope.resizing);
                
                // Add a timeout to not call the resizing function every pixel
                $scope.resizing = $timeout( function() {
                    
                    $scope.getDimensions();
                }, 300);
            });
        }
    }
}]);