'use strict';

var ng_app = angular.module('SFAdapter', []);

ng_app.controller("CommonController", fjs.controllers.CommonController);
ng_app.controller("NewCallController", fjs.controllers.NewCallController);
ng_app.controller("CallsListController", fjs.controllers.CallsListController);
ng_app.controller("CallController", fjs.controllers.CallController);
ng_app.controller("DialpadController", fjs.controllers.DialpadController);
ng_app.controller("TransferDialog", fjs.controllers.TransferDialog);
ng_app.controller("WarningsController", fjs.controllers.WarningsController);
ng_app.controller("MainController", fjs.controllers.MainController);