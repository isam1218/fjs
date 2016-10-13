hudweb.directive('styleParent', function(){ 
   return {
     restrict: 'A',
     link: function(scope, elem, attr) {
         elem.on('load', function() {
            var w = $(this).width(),
                h = $(this).height();

            if(w > h){
            	elem.addClass('AttachmentImgWidth');
            }
            else {
            	elem.addClass('AttachmentImgHeight');
            }

         });
     }
   };
});