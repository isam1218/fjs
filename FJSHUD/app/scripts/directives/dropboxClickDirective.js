hudweb.directive('dropboxClick', function(){
  return {
    restrict: 'A',
    link: function(scope, elem, attr) {

      elem.bind('click', function() {
        scope.$apply(attr.dropboxClick);
      });

    }
  }
});