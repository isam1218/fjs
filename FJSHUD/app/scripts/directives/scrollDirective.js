hudweb.directive('scrollToBottom', function () {
  return {
    scope: {
      scrollBottom: "="
    },
    link: function (scope, element) {                	
          scope.$watch('scrollToBottom', function () {//newValue         
        	 $(element).animate({scrollTop: $(element).prop("scrollHeight")});        	
          });
    }
  };
});