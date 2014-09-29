fjs.core.namespace("fjs.ui");

fjs.ui.ChatController = function($scope, dataManager) {
    fjs.ui.Controller.call(this, $scope);
    $scope.model = dataManager.getModel('streamevent');
    $scope.messages = $scope.model.items;
    $scope.scrollBottom = function() {
        var listViewContent = document.getElementById('ListViewContent');
        var _sh = listViewContent.scrollHeight;
        listViewContent.scrollTop = _sh;
    };
    var oncomplete = function() {
        setTimeout(function(){
            $scope.$safeApply();
            $scope.scrollBottom();
        },50);
    };
    $scope.model.addEventListener('complete', oncomplete);

    $scope.$on("$destroy", function() {
        $scope.model.removeEventListener('complete', oncomplete);
    });

};
fjs.core.inherits(fjs.ui.ChatController, fjs.ui.Controller);