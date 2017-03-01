hudweb.directive('topNavBehavior', function() {
	return {
	  link : function(scope, element, attrs) {    		      		  
		  //'more' section
		  if(scope.voicemail && scope.smallScreen)
		  	$(scope.moreIcon).show();
		  else
		  	$(scope.moreIcon).hide();
		  
		  $(element).bind('mouseleave', function() {
		  	scope.showDropdown = false;
			scope.showHideiconsDropdown();
		  }); 
		  
		  scope.$on('watchWindowResize::resize', function( event, data ) {		     		      
		      scope.windowWidth  = data.width;
		      
		      if(scope.windowWidth <= 1195)
		    	  scope.smallScreen = true;
		      else
		    	  scope.smallScreen = false;		      
		     
		      //'more' section
		      if(scope.voicemail && scope.smallScreen)
		      	$(scope.moreIcon).show();
		      else
		      	$(scope.moreIcon).hide();
	      		      
		  });	
	  }
   };
});         