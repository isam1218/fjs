namespace("fjs.controllers");

fjs.controllers.NewCallController = function($scope, $element, dataManager) {
    $scope.phone ="";

    var dialpadPlate = document.getElementById("plate");
    dialpadPlate.onclick = function(e) {
        $scope.$apply(function() {
            $scope.closeDialpad();
        });
    };

    $scope.actionCall = function(phone) {
        dataManager.sendAction(fjs.model.MeModel.NAME, "callTo", {"phoneNumber":phone});
        $scope.phone = "";
        $scope.closeDialpad();
    };

    $scope.showDialpad = function() {
        if($scope.dialogPath) {
            $scope.closeDialpad();
        }
        else {
            $scope.dialogPath = "templates/dialpad.html";
            dialpadPlate.style.display = "block";
            focusPhoneInput();
        }
    };

    $scope.closeDialpad = function() {
         $scope.dialogPath=null;
        dialpadPlate.style.display = "none";
    };

    $scope.$on('onDilapadKey', function(event, key) {
        $scope.phone+=key;
        focusPhoneInput();
    });

    var focusPhoneInput = function() {
        var input = document.getElementById("inputPhone");
        input.focus();
    }
};