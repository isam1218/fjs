namespace("fjs.controllers");

fjs.controllers.NewCallController = function($scope, $element) {
    var fdp = new fjs.fdp.SyncManager();
    var sfApi = new SFApi();
    $scope.phone ="";

    $scope.actionCall = function(phone) {
        fdp.sendAction("me", "callTo", {"a.phoneNumber":phone});
        $scope.phone = "";
        $scope.closeDialpad();
    };

    $scope.showDialpad = function() {
        if($scope.dialogPath) {
            $scope.closeDialpad();
        }
        else {
            $scope.dialogPath = "templates/dialpad.html";
            document.getElementById("plate").style.display = "block";
            focusPhoneInput();
        }
    };

    $scope.closeDialpad = function() {
         $scope.dialogPath=null;
         document.getElementById("plate").style.display = "none";
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