var hud_dir = angular.module('HUD_Dir', ['HUD_model']);

hud_dir.directive('contextMenu', fjs.directive.ContextMenu);
hud_dir.directive('contextMenuDialog', fjs.directive.ContextMenuDialog);
hud_dir.directive('avatarMenu', fjs.directive.AvatarMenu );
hud_dir.directive('unpin', fjs.directive.Unpin);
hud_dir.directive('contactsList', ['$parse', 'DataManager', fjs.directive.ContactsList]);
hud_dir.directive('contactSearch', ['$document', fjs.directive.ContactSearch]);