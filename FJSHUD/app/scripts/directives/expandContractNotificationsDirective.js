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
            	var content = $(element).find('.NotificationSection:not(.last)');
            	//set the max height of the expanded notifications
            	var topParentHeight = $('.LeftBar').outerHeight() - $('.LeftBar .TitleBar.hasButton').outerHeight() - $('.LeftBar .Phone').outerHeight() - 5;
            	$('.LeftBar .NotificationMessages .scroller').css('max-height', topParentHeight);
				
				// turn on expandability
				$('.LeftBarNotificationSection').css('position', 'absolute');
            	
	       		if(!hoverFlag && content.length > 0){
	       			$('.LeftBar .NotificationDivider.firstHeaderDivider .headerText').hide();
	       			$scope.$safeApply(function(){
	       			   $scope.showAllNotifications = true;
	       			});   
	       		    hoverFlag = true;	   
	       		    
       		        $.each(content, function(idx){                       
	       			    var targetHeight = $(this).find('.chatNotification').outerHeight() + 20;
	       			    if($(this).find('.NotificationZoomBtn').length > 0)
	       			    {	
	       			    	targetHeight += $(this).find('.NotificationZoomBtn').outerHeight();
	       			    }	
	       			    var origHeight = (browser == "Firefox") ? 15 : 0;
	       			    var topPos = (browser == "Firefox") ? $(this).hasClass('firstsection') ? 0 : -10 : -targetHeight;
	       			    if(idx == 0)
	       			    	$(this).closest('.Messages').addClass('firstMessage');
	       		        
	       			    $(this).stop().animate({ top: 0, height: origHeight }, animTime);	
       				    $(this).stop().animate({top: topPos, height: targetHeight }, animTime);			       			    
	       			   
	       		         $(this).addClass('open'); 			       		         
       		        }); 	       		      
   		            setTimeout(function(){ hoverFlag = false; }, animTime);	       		        
	       		  }		
            });
            $(element).on('mouseleave', function() {
            	$scope.showNotificationBody = $scope.todaysNotifications.length > 3 ? false:true;
            	
            	$('.LeftBar .NotificationDivider.firstHeaderDivider .headerText').show();
            	var content = $(element).find('.NotificationSection:not(.last)');
            	$('.LeftBar .NotificationMessages .scroller').css('max-height', '');
            	
            	$scope.$safeApply(function(){
            	   $scope.showAllNotifications = false;    
            	});
            	if(content.length > 0){
	        	    $.each(content, function(idx){	
	        	    	if(idx == 0)
	        	    	  $(this).closest('.Messages').removeClass('firstMessage');
	        	    	
	        	    	if(browser == "Firefox") {	
							var topPos = $(this).hasClass('firstsection') ? 0 : -10;
	        				$(this).stop().animate({ top: topPos, height: 15 }, animTime, function() {
								$('.LeftBarNotificationSection').css('position', 'relative');
							});	
	        	    	}
	        	    	else {
	        	    		$(this).stop().animate({top: 0, height: 0 }, animTime, function() {
								$('.LeftBarNotificationSection').css('position', 'relative');
							});   
						}
						
	        	        $(this).removeClass('open');          
	        	    });            	
     
        	        hoverFlag = false;  
            	}
        		
            });
       }
   };
});