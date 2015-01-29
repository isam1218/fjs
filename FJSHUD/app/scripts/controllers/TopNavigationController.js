hudweb.controller('TopNavigationController', ['$scope', function($scope) {

    $scope.appIcons = [
        {title:"Me", url:"#/settings", key:"Me"}
        , {title:"Calls and Recordings", url:"#/calllog", key:"CallLog"}
        , {title:"Conferencing", url:"#/conferences", key:"Conferences"}
        , {title:"Call Center", url:"#/callcenter", key:"CallCenter"}
        , {title:"Search", url:"#/search", key:"Search"}
        , {title:"Video Collaboration", url:"#/zoom", key:"Zoom"}
        , {title:"Box", url:"#/box", key:"Box"}
    ];


    $scope.$on("$destroy", function() {
	
    });

}]);