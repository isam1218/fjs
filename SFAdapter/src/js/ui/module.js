'use strict';

var ng_app = angular.module('SFAdapter', ['SFA_model', 'SF_API']);

ng_app.controller("NewCallController", ['$scope', '$element', 'DataManager', fjs.controllers.NewCallController]);
ng_app.controller("CallsListController", ['$scope', 'DataManager', fjs.controllers.CallsListController]);
ng_app.controller("CallLogsController", ['$scope', 'DataManager', fjs.controllers.CallLogsController]);
ng_app.controller("CallController", ['$scope', '$element', '$timeout', '$filter', '$sce', 'DataManager', 'SFApi', fjs.controllers.CallController]);
ng_app.controller("CallLogDialogController", ['$scope', '$element', '$timeout', '$filter', '$sce', 'DataManager', 'SFApi', fjs.controllers.CallLogDialogController]);
ng_app.controller("DialpadController", ['$scope', fjs.controllers.DialpadController]);
ng_app.controller("TransferDialog", ['$scope', fjs.controllers.TransferDialog]);
ng_app.controller("WarningsController", ['$scope', '$element', 'DataManager', fjs.controllers.WarningsController]);
ng_app.controller("MainController", ['$scope', '$element', 'DataManager', 'SFApi', fjs.controllers.MainController]);