hudweb.directive('messagescroll', ['$compile',
  function($compile) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      // required to show new messages on-the-fly
      var formatMessage = function(){
        var message = scope.message;
        switch(message.type){
          case "vm":
            if(message.vm && message.vm.transcription != ""){
              return vm.transcription;
            }else{
              return "transcription is not available";
            }
            break;
          case 'missed-call': 
            return "Missed call from extension " + message.phone; 
            break;
          default:
            return message.message.replace(/\n/g, '<br/>');
        }
      };

      scope.$watch("message.message",function(){        
        element.html(formatMessage());
        if (scope.message.type == 'chat'){
          setTimeout(function(){
            element.parent()[0].scrollTop = element.parent()[0].scrollHeight;
          }, 100);
        }
      });
    }

  };
}]);