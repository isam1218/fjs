hudweb.directive('clickAnywhere', function($document){
  return {
    restrict: 'A',
    link: function(scope, elem, attr, ctrl) {
      elem.bind('click', function(e) {
        // this part keeps it from firing the click on the document.
        e.stopPropagation();
      });
      $document.bind('click', function() {
        // magic here.
        if (scope.chat.attachmentItems){
          scope.chat.showBG = false;
          scope.$apply(attr.clickAnywhere);
        }
      });
      scope.$on('$destroy', function(){
        $document.unbind('click');
      });
    }
  }
});