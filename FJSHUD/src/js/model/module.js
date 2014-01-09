var hud_model = angular.module('HUD_model', []);

hud_model.service('DataManager', fjs.hud.FDPDataManager);
hud_model.filter('ContactsWithoutMe', fjs.hud.filter.ContactsWithoutMe);