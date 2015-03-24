hudweb.directive('input', function() {
	return {
		restrict: 'E',		
		link: function(scope, element, attrs) {
			
		  if(attrs.type == 'search')
		  {	  
			if(navigator.userAgent.indexOf('Firefox') != -1)
			{
				var toggle = function(v){
					return v?'addClass':'removeClass'; 
				};
				// search input
				element.on('keyup change mouseover mouseenter', function(e) {											
						if(element.val() != '')
						{
							if($(element).parent().find('.x').length == 0)
							{
							 scope.$apply(function (e) {
								var xImg = angular.element('<img class="x" src="img/clear.png"/>');
								element.after(xImg);
								var el = element;
								xImg.bind('click', function(e){
									scope.$apply(function () {				
									    $(el).parent().find('.x').remove();	
										el.val('');
									});
									e.stopPropagation();
								});																	
							 });	
							}
						}
						else
						{
							scope.$apply(function () {
								$(element).parent().find('.x').remove();
							});
						}				
					e.stopPropagation();
				});
				
				$(element).parent().on('mouseleave', function() {						
					scope.$apply(function () {
						$(element).parent().find('.x').remove();		
					});
					e.stopPropagation();
				});											
			}
		  }
		}			
	};	
});