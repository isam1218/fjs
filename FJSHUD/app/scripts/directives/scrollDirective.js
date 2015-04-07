hudweb.directive('scrollToBottom', function () {
  return {
    scope: {
      schrollBottom: "="
    },
    link: function (scope, element) {                	
          scope.$watch('scrollToBottom', function () {//newValue         
        	 $(element).animate({scrollTop: $(element).prop("scrollHeight")});        	
          });
    }
  }
})