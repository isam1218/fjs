hudweb.directive('input', function() {
	return {
		restrict: 'E',		
		link: function(scope, element, attrs) {
			
		  if(attrs.type == 'search')
		  {	  
			if(navigator.userAgent.indexOf('Firefox') != -1)
			{				
				// search input
				element.on('keyup change mouseover mouseenter', function(e) {											
						if(element.val() != '')
						{
							if($(element).parent().find('.x').length == 0)
							{
							 scope.$apply(function (e) {
								var xImg = angular.element('<img class="x" src="img/clear.png"/>');
								if($(element).closest('.ConferenceMembers').length > 0)
									element.parent().append(xImg);
								else
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
				
				$(element).parent().on('mouseleave', function(e) {						
					scope.$apply(function () {
						$(element).parent().find('.x').remove();		
					});
					e.stopPropagation();					
				});	
			
				$('a, input[type=button]').on('click mouseover mouseenter', function(e){
					scope.$apply(function () {
						$(element).parent().find('.x').remove();	
						if(e.type == 'click')
							element.val('');
					});
					e.stopPropagation();
				});
			}
		  }
		}			
	};	
});