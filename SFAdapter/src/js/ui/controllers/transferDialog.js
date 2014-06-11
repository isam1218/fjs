namespace("fjs.controllers");
fjs.controllers.TransferDialog = function($scope) {
    $scope.transfer_phone = "";
    $scope.dialpadPath = "templates/dialpad.html";

    $scope.$on('onDilapadKey', function(event, key) {
        $scope.transfer_phone+=key;
        var input = document.getElementById("inputTransfer");
        input.focus();
    });

    $scope.transfer = function() {
        $scope.$emit("transfer", $scope.transfer_phone);
    };
};