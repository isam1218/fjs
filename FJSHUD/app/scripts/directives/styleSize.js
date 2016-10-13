hudweb.directive('styleSize', function(){ 
   return {
     restrict: 'A',
     link: function(scope, elem, attr) {
            var w = $(this).width(),
                h = $(this).height();

            if(w > h){
            	elem.addClass('AttachmentImgWidth');
            }
            else {
            	elem.addClass('AttachmentImgHeight');
            }    
     }
   };
});