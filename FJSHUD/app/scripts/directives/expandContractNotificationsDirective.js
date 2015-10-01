hudweb.directive('expandContractNotifications', function() {
      return {
         link : function(scope, element, attrs) {
        	var animTime = 50, hoverFlag = false;
			var scrollWatcher;
        	var nua = navigator.userAgent;
        	var browser = nua.match(/(chrome|safari|firefox|msie)/i);
        	//if not found, default to IE mode
        	browser = browser && browser[0] ? browser[0] : "MSIE";
        	var $scope = scope;
        	
            $(element).on('hoverIntent mouseenter', function() {
				$(this).addClass('Expand');
				
				// watch for new notifications while this is open
				scrollWatcher = scope.$watchCollection('todaysNotifications', function () {
					$('.LeftBar .NotificationMessages .scroller').animate({
						scrollTop: $('.LeftBar').outerHeight() 
					});
				});
				
            	$scope.showNotificationBody = true;            	
            	var content = $(element).find('.NotificationSection:not(.last)');
            	var last = $(element).find('.NotificationSection.last');
            	//set the max height of the expanded notifications
            	var topParentHeight = $('.LeftBar').outerHeight() - $('.LeftBar .TitleBar').outerHeight() - $('.LeftBar .Phone').outerHeight() - $('.LeftBar .CallStatusContainer').outerHeight() - 20;
            	$('.LeftBar .NotificationMessages .scroller').css('max-height', topParentHeight + 'px');
            	
	       		if(!hoverFlag && content.length > 0){				
	       			$('.LeftBar .NotificationDivider.firstHeaderDivider .headerText').hide();
					$('.LeftBar .NotificationDivider.firstHeaderDivider').hide();
	       			$scope.$safeApply(function(){
	       			   $scope.showAllNotifications = true;
	       			});   
	       		    hoverFlag = true;	   
	       		    
	       		    var scroll_height = 0;
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
	       		         scroll_height += targetHeight;
       		        }); 
       		        
       		        scroll_height += $(last).outerHeight() + 20;
       		        
       		        $('.LeftBar .NotificationMessages .scroller').animate({
						scrollTop: scroll_height
					});
   		            setTimeout(function(){ hoverFlag = false; }, animTime);	       		        
	       		  }		
            });
			
            $(element).on('mouseleave', function() {
				$(this).removeClass('Expand');
				
				// turn off watcher
				scrollWatcher();
				
            	$scope.showNotificationBody = $scope.todaysNotifications.length > 3 ? false:true;
            	
            	$('.LeftBar .NotificationDivider.firstHeaderDivider .headerText').show();
              $('.LeftBar .NotificationDivider.firstHeaderDivider').show();
            	var content = $(element).find('.NotificationSection:not(.last)');
            	
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
								$('.LeftBar .NotificationMessages .scroller').css('max-height', '');
							});	
	        	    	}
	        	    	else {
	        	    		$(this).stop().animate({top: 0, height: 0 }, animTime, function() {
								$('.LeftBar .NotificationMessages .scroller').css('max-height', '');
							});   
						}
						
	        	        $(this).removeClass('open');          
	        	    }); 				
     
        	        hoverFlag = false;  
            	}	
				else
					$('.LeftBar .NotificationMessages .scroller').css('max-height', '');
            });
       }
   };
});