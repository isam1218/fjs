fjs.core.namespace("fjs.hud.react");
fjs.hud.react.ContactsList = React.createClass({
    displayName: "ContactsList",
    render: function() {
        var scope = this.props.scope;
        var keys = Object.keys(scope.contacts), contacts=[];

        for(var i = 0, iLen = keys.length; i < iLen; i++) {
            if(!scope.query || scope.contacts[keys[i]].pass(scope.query)) {
				// add missing field
				if (scope.contacts[keys[i]][scope.sortField] === undefined)
					scope.contacts[keys[i]][scope.sortField] = "";
				
                contacts.push(scope.contacts[keys[i]]);
            }
        }
        var _contacts = contacts.sort(function(a, b){
            if(a[scope.sortField]>b[scope.sortField]) {
                return scope.sortReverce ? -1 : 1;
            }
            else if(a[scope.sortField]<b[scope.sortField]) {
                return scope.sortReverce ? 1 : -1;
            }
            else {
                return 0;
            }
        })

        var contactsList = _contacts.map(function(contact, index, array) {
            var oncontextMenu, onavatarClick;
            (function() {
                oncontextMenu = function(e) {
                    e.stopPropagation();
                    e.preventDefault();
                    scope.showMenu({key:"contextMenu", x:e.clientX, y:e.clientY, model: contact});
                    return false;
                };
				
				// open chat panel
				onLoadChat = function(e) {
                    e.stopPropagation();
                    e.preventDefault();
					scope.loadChat(contact);
					return false;
				};
            })(contact);

            var _listRowStatusText = React.DOM.div({className:'ListRowStatusText'}, contact.contactstatus_xmppCustom || contact.contactstatus_xmpp || 'offline');
            var _listRowStatusIconQueue = React.DOM.div({className:'ListRowStatusIcon XIcon-QueueStatus XIcon-QueueStatus-'+contact.contactstatus_queueStatus});
            var _listRowStatusIconChat = React.DOM.div({className:'ListRowStatusIcon XIcon-ChatStatus-'+contact.getChatStatus()});
            var _listRowStatus = React.DOM.div({className:'ListRowStatus'}, _listRowStatusIconChat, _listRowStatusIconQueue, _listRowStatusText);
            var _listRowTitleName = React.DOM.div({className:'name'}, React.DOM.b(null, contact.getDisplayName()), React.DOM.span({className:'details'}, '#'+contact.primaryExtension));
            var _listRowTitle = React.DOM.div({className:'ListRowTitle'}, _listRowTitleName);
            var _listRowContent = React.DOM.div({className:'ListRowContent', onClick:onLoadChat}, _listRowTitle, _listRowStatus);
			
			// attach message notification bubble
			var _avatarEvents = contact.events ? React.DOM.div({className:'EventsBaloon'}, contact.events) : '';

            var _imgAvatar = React.DOM.img({className:'AvatarImgPH', src:contact.getAvatarUrl(28,28), onClick:oncontextMenu});
            var _avatarForground = React.DOM.div({className:'AvatarForeground AvatarInteractable'});
            var _avatarHolder = React.DOM.div({className: 'Avatar AvatarNormal', onClick:oncontextMenu}, _imgAvatar, _avatarForground, _avatarEvents);

            return React.DOM.a({className: "ListRowFirst ListRow ListRow-Contact", onContextMenu:oncontextMenu}, _avatarHolder, _listRowContent);
			// href:"#/contact/"+contact.xpid
        });
        return React.DOM.div({className:"LeftBarTabContentList"}, contactsList);
    }
});