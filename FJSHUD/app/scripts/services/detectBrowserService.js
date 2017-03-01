hudweb.service('detectBrowser', ['$window', 
    function( $window ) {
        
        
        // http://stackoverflow.com/questions/22947535/how-to-detect-browser-using-angular
        return function() {
            var userAgent = $window.navigator.userAgent,
                browsers  = { 
                    chrome  : /chrome/i,
                    safari  : /safari/i,
                    firefox : /firefox/i,
                    ie      : /internet explorer/i
                };
            
            for ( var key in browsers ) {
                if ( browsers[key].test(userAgent) ) {
                    return key;
                }
            }
            
            return 'unknown';
        }
}]);