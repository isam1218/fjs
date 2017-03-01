hudweb.factory('windowDimensions', ['$window', 'detectBrowser', 
    function( $window, detectBrowser ) {
        var browser = detectBrowser();
        
        return {
            height: function() {
               return $(document).height();
            },
                      
            width : function() {
                return $(document).width();
            }
        }
}]);