hudweb.directive('expandContractNotifications', function() {
      return {
         link : function(scope, element, attrs) {
        	var animTime = 300, hoverFlag = false; 
        	var nua = navigator.userAgent;
        	var browser = nua.match(/(chrome|safari|firefox|msie)/i);
        	//if not found, default to IE mode
        	browser = browser && browser[0] ? browser[0] : "MSIE";
        	var $scope = scope;
        	
            $(element).on('hoverIntent mouseenter', function() {   
            	$scope.showNotificationBody = true; 
            	$scope.showHeader = true;
	       		 if(!hoverFlag){
	       		       hoverFlag = true;		     		     
	       		       var content = $(element).find('.NotificationSection:not(.last)'); 
	       		       if(content.length <= 1)
	       		       {
	       		    	   if($(element).find('.TitleBar.noNotifications').length > 0)
	       		    	   {
	       		    		$(element).find('.TitleBar.noNotifications').show();
	       		    	   }	   
	       		       }
	       		       else
	       		       {	   
		       		       $.each(content, function(){               
			       			    var targetHeight = $(this).find('.chatNotification').outerHeight();    	
			       			    var origHeight = (browser == "Firefox") ? 18 : 15;
			       			    var topPos = (browser == "Firefox") ? 0 : -targetHeight;
			       		        
			       			    $(this).stop().animate({ top: 0, height: origHeight }, animTime);	
		       				    $(this).stop().animate({top: topPos, height: targetHeight }, animTime);			       			    
			       			   
			       		         $(this).addClass('open');  
		       		       });  
	       		       }
	       		       setTimeout(function(){ hoverFlag = false; }, animTime);
	       		  }		
            });
            $(element).on('mouseleave', function() {
            	$scope.showNotificationBody = $scope.todaysNotifications.length > 3 ? false:true;
            	$scope.showHeader = false;
            	var content = $(element).find('.NotificationSection:not(.last)'); 	
            	if(content.length <= 1)
    		    {
    		    	   if($(element).find('.TitleBar.noNotifications').length > 0)
    		    	   {
    		    		   $(element).find('.TitleBar.noNotifications').hide();
    		    	   }	   
    		    }
            	else
            	{	
	        	    $.each(content, function(){		        
	        	    	if(browser == "Firefox")				 
	        				$(this).stop().animate({ top: 0, height: 18 }, animTime);	
	        	    	else
	        	    		$(this).stop().animate({top: 0, height: 15 }, animTime);           
	        	        $(this).removeClass('open');          
	        	    }); 
            	}

        	    hoverFlag = false;  
            });
       }
   };
});