hudweb.directive('getScrollHeight',function() {	
	return {
		restrict: 'A',
		link: function(scope, element, attrs) {	 		  			
		        	
		          var parentHeight = $('.LeftBar').outerHeight();
		  		  var roundTopHeight = $('.LeftBar .RoundedTop').outerHeight(); 
		  		  var topHeight = $('.LeftBar .LeftBarTop').outerHeight();		  		 		  		  
		  		  var phoneHeight = $('.LeftBar .Phone').outerHeight();
                  var lists = $('.LeftBar .ContactList');                               
                 
                  scope.$watch(function () {
                      return element.height();
                  },
                  function (newValue, oldValue) {
                      if (newValue != oldValue) {
                          // Set the height
                    	  $.each(lists, function(){
		                	  var headerHeight = $(this).parent().find('.Header').outerHeight(); 
		                	  
		                	  if($(element).find('.Messages').length == 0)
			                	 var list_height = (parentHeight - roundTopHeight - topHeight - headerHeight - newValue -  phoneHeight) + 15;
		                	  else
		                		 var list_height = (parentHeight - roundTopHeight - topHeight - headerHeight - newValue -  phoneHeight - 5);// + 10;	
			                  
			                  //change the height for the 'recent' tab since we do not show the header
			                  if($(this).closest('.Recent').length > 0)
			                	  list_height += (headerHeight + 10);
						   	
							  $(this).css('height', list_height + 'px');
							  
							  $(this).children().first().css('height', list_height + 'px');
		                }); 
                      }
                  },
                  true);                		      		    	     
		}
	};
});