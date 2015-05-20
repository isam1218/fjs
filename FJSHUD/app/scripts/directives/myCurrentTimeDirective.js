// Register the 'myCurrentTime' directive factory method.
// We inject $interval and dateFilter service since the factory method is DI.
hudweb.directive('myCurrentTime', ['$interval', function($interval) {
    // return the directive link function. (compile function not needed)
    return{       	
    	link: function(scope, element, attrs) {
  	     
	      var stopTime; // so that we can cancel the time updates
	      var minutes = 0;
	      var seconds = 0;
	      var hours = 0;
	      var minutesText = '0';
	      var secondsText = '0'; 	
	      var hoursText = '0'; 
	
	      // used to update the UI
	      function updateTime() {
	    	seconds++;  
	    	if(seconds == 60)
	    	{
	    		seconds = 0;
	    		minutes++;
	    	}
	    	if(minutes == 0)
	    	{
	    		seconds = 0;
	    		minutes = 0;
	    		hours++;
	    	}	
	    	//seconds
	    	if(seconds < 10)
	    		secondsText = '0'+seconds;
	    	else
	    		secondsText = seconds;
	    	//minutes
	    	if(minutes < 10)
	    		minutesText = '0'+minutes+":";
	    	else
	    		minutesText = minutes+":";
	    	
	    	if(hours < 10){
	    		hoursText = '0'+hours+":";
	    	}
	    	else
	    		hoursText = hours+":";
	    	
	        $(element).text(hoursText+minutesText+secondsText);
	      }	
	      
	      stopTime = $interval(updateTime, 1000);
	      	      	      
	      
	      // listen on DOM destroy (removal) event, and cancel the next UI update
	      // to prevent updating time after the DOM element was removed.	     
	      element.on('$destroy', function() {	    	
	        	$interval.cancel(stopTime);   	    	  
	      });	     
    	}
     };
}]);