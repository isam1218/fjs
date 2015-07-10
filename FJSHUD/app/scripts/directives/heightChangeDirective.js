hudweb.directive('resizeHeight', function () {
    return {
		restrict: 'A',
		link: function(scope, element, attrs) {
			var totalElHeights = $('.WidgetZoomBody').height() - ($('.ZoomWidgetSection.right').height() + $(".WidgetFont").height() + 60);
	        var ttlPctUsed = Math.round((totalElHeights / $('.WidgetZoomBody').height()) * 100);
	        $(element).css("max-height", ttlPctUsed +"%");
	        
			//resizes the added contacts div 
			scope.$on('watchWindowResize::resize', function( event, data ) {		
		        totalElHeights = $('.WidgetZoomBody').height() - ($('.ZoomWidgetSection.right').height() + $(".WidgetFont").height() + 60);
		        ttlPctUsed = Math.round((totalElHeights / $('.WidgetZoomBody').height()) * 100);
		        $(element).css("max-height", ttlPctUsed +"%");
		    });
		}
    };  
});