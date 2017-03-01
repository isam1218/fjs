hudweb.directive('clearFieldOnKeypress', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                	$(element).val('');
                });

                event.preventDefault();
            }
        });
    };
});