namespace("fjs.controllers");
fjs.controllers.DialpadController = function($scope) {
    $scope.clickDialpad = function(key){
        $scope.$emit("onDilapadKey", key);
    };
};