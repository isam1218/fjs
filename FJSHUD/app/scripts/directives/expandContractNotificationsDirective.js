hudweb.directive('expandContractNotifications', function() {
      return {
         link : function(scope, element, attrs) {
        	var animTime = 50, hoverFlag = false;
			var scrollWatcher;
			var container = element[0].getElementsByClassName('scroller')[0];
        	var nua = navigator.userAgent;
        	var browser = nua.match(/(chrome|safari|firefox|msie)/i);
        	//if not found, default to IE mode
        	browser = browser && browser[0] ? browser[0] : "MSIE";
        	var $scope = scope;
			
			// update class when length of messages changes
			scope.$watch(function() {				
				return container.children.length;
			}, function(val) {
				if (val > 0)
					element.removeClass('noMessages').addClass('hasMessages');
				else
					element.removeClass('hasMessages').addClass('noMessages');
			});
        	
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
	       			$scope.$digest(function(){
	       			   $scope.showAllNotifications = true;
	       			});   
	       		    hoverFlag = true;	   
	       		    
	       		    var scroll_height = 0;
	       		    var nLen = $(content).length;
       		        //$.each(content, function(idx){ 
	       		    for(var n = 0; n < nLen; n++)
	       		    {	
	       			    var item = $(content)[n];
	       		    	var targetHeight = $(item).find('.chatNotification').outerHeight() + 20;
	       		    	
	       			    if($(item).find('.NotificationZoomBtn').length > 0)
	       			    {	
	       			    	targetHeight += $(item).find('.NotificationZoomBtn').outerHeight();
	       			    }
	       			    
	       			    var origHeight = (browser == "Firefox") ? 15 : 0;
	       			    var topPos = (browser == "Firefox") ? $(item).hasClass('firstsection') ? 0 : -10 : -targetHeight;
	       			   
	       			    if(n == 0)
	       			    	$(item).closest('.Messages').addClass('firstMessage');
	       		        
	       			    $(item).stop().animate({ top: 0, height: origHeight }, animTime);	
       				    $(item).stop().animate({top: topPos, height: targetHeight }, animTime);			       			    
	       			   
	       		         $(item).addClass('open'); 	
	       		         scroll_height += targetHeight;
       		        } 
       		        
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
            	
            	$scope.$digest(function(){
            	   $scope.showAllNotifications = false;    
            	});
            	if(content.length > 0){
            		var lLen = $(content).length;
	        	    //$.each(content, function(idx){	
            		for(var l = 0; l < lLen; l++)
	       		    {
            			var item = $(content)[l];
            			
	        	    	if(l == 0)
	        	    	  $(item).closest('.Messages').removeClass('firstMessage');
	        	    	
	        	    	if(browser == "Firefox") {	
							var topPos = $(item).hasClass('firstsection') ? 0 : -10;
	        				$(item).stop().animate({ top: topPos, height: 15 }, animTime, function() {
								$('.LeftBar .NotificationMessages .scroller').css('max-height', '');
							});	
	        	    	}
	        	    	else {
	        	    		$(item).stop().animate({top: 0, height: 0 }, animTime, function() {
								$('.LeftBar .NotificationMessages .scroller').css('max-height', '');
							});   
						}
						
	        	        $(item).removeClass('open');          
	        	    } 				
     
        	        hoverFlag = false;  
            	}	
				else
					$('.LeftBar .NotificationMessages .scroller').css('max-height', '');
            });
       }
   };
});