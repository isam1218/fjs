var hud_model = angular.module('HUD_model', []);

hud_model.service('DataManager', fjs.hud.DataManager);

hud_model.filter('ContactsWithoutMe', fjs.hud.filter.ContactsWithoutMe);

hud_model.filter('SortConference', fjs.hud.filter.SortConferenceFilter);

hud_model.filter('SortVoicemail', fjs.hud.filter.SortVoicemailFilter);

hud_model.filter('SortCalllog', fjs.hud.filter.SortCalllogFilter);

hud_model.filter('ExternalContacts', fjs.hud.filter.ExternalContacts);

hud_model.filter('Duration', fjs.hud.filter.DurationFormatFilter);

hud_model.filter('ResentsSortFilter', fjs.hud.filter.ResentsSortFilter);

hud_model.filter('ChatFilter', fjs.hud.filter.ChatFilter);


hud_model.filter('ContactVoicemailsFilter', fjs.hud.filter.ContactVoicemails);

