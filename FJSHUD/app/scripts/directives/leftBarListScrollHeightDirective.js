hudweb.directive('getScrollHeight', ['$rootScope',function($rootScope) {	
	return {
		restrict: 'A',
		link: function(scope, element, attrs) {	 		  			
		        	
		          var parentHeight = $('.LeftBar').outerHeight();
		  		  var roundTopHeight = $('.LeftBar .RoundedTop').outerHeight(); 
		  		  var topHeight = $('.LeftBar .LeftBarTop').outerHeight();		  		 		  		  
		  		  var phoneHeight = $('.LeftBar .Phone').outerHeight();                                                 
                 
                  scope.$watch(function () {
                      return element.height();
                  },
                  function (newValue, oldValue) {               	                 	  
                      if (newValue != oldValue) {
                    	  
                    	  var list = $('.LeftBar .ContactList');
                          // Set the height                    	 
	                	  var headerHeight = $(list).parent().find('.Header').outerHeight(); 
	                	  
	                	  if($(element).find('.Messages').length == 0)
		                	 var list_height = (parentHeight - roundTopHeight - topHeight - headerHeight - newValue -  phoneHeight) + 15;
	                	  else
	                		 var list_height = (parentHeight - roundTopHeight - topHeight - headerHeight - newValue -  phoneHeight - 5);// + 10;	
		                  
		                  //change the height for the 'recent' tab since we do not show the header
		                  if($(list).closest('.Recent').length > 0)
		                	  list_height += (headerHeight + 10);
					   	
						  $(list).css('height', list_height + 'px');
						  
						  $(list).children().first().css('height', list_height + 'px');
						  
						  $rootScope.$broadcast('NotificationsheightChanged', list_height);
		               							  
                      }
                  },
                  true);                		      		    	     
		}
	};
}]);