hudweb.directive('transferContactSearch', ['$rootScope', '$document', 'ContactService', function($rootScope, $document, contactService) {
  var contacts = [];
  var recentTransfers = [];
  var recentXpids = [];

  contactService.getContacts().then(function(data) {
    contacts = data;
    if (localStorage['recentTransfers_of_' + $rootScope.myPid]){
      // LS --> obj of xpids
      recentXpids = JSON.parse(localStorage['recentTransfers_of_' + $rootScope.myPid]);
      for (var i = 0; i < data.length; i++){
        var current = data[i].xpid;
        if (current == recentXpids[current]){
          recentTransfers.push(data[i]);
        }
      }
    }
  });
  
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      var overlay, inset, headerTitle, rows, recentTransferRows, recentTransferHeader, contactsHeader;
      var added = false;
      var rect = element[0].getBoundingClientRect();
      
      element.css('position', 'relative');
      element.css('z-index', 100);
        
      // create overlay elements      
      inset = angular.element('<div class="Inset TransferInset"></div>');
      inset.css('margin-top', rect.height*1.5 + 'px');
      
      var addTeamMemberHeader = function(){
        overlay = angular.element('<div class="SearchContactOverlay conferenceSearch transferSearch"></div>');
        headerTitle = angular.element('<div class="Header TransferHeader">Add a Contact</div>');
        overlay.append(headerTitle);
      };
      
      addTeamMemberHeader();
      recentTransferHeader = angular.element('<div class="Header TransferHeader">Recent Transfers</div>');
      recentTransferRows = angular.element('<div id="recentTransferRows" class="rows"></div>');
      contactsHeader = angular.element('<div class="Header TransferHeader">Contacts</div>');
      rows = angular.element('<div class="rows"></div>');

      // search input
      element.bind('keyup', function(e) {
        if (added) {
          recentTransferRows.empty();
          rows.empty();       
          overlay.remove();
        }

        // if user deletes search input, need to reset inset and create new rows div
        if (e.keyCode == 8 || e.keyCode == 46){
          inset.empty();
          rows = angular.element('<div class="rows"></div>');
        }
        
        // Regular contacts
        if (element.val().length > 0) {
          rows.empty();
          recentTransferRows.empty();

          var contactMatchCount = 0;
          // REGULAR
          for (var c = 0, len = contacts.length; c < len; c++) {
            // if search term matches item in contacts --> make line and add to rows
            if (contacts[c].xpid != $rootScope.myPid && contacts[c].displayName !== undefined && contacts[c].displayName.search(new RegExp(element.val(), 'i')) != -1 || contacts[c].primaryExtension.search(new RegExp(element.val(), 'i')) != -1 || contacts[c].phoneMobile.search(new RegExp(element.val(), 'i')) != -1 || contacts[c].phoneBusiness.search(new RegExp(element.val(), 'i')) != -1 ){
              var line = makeLine(contacts[c], false, c);
              //appending contact match to rows
              rows.append(line);
              contactMatchCount++;
            }
          // if no matches -> make line for phone number
          }
          var transferMatchCount = 0;
          //RECENT
          for (var t = 0; t < recentTransfers.length; t++){
            if (recentTransfers[t].xpid != $rootScope.myPid && recentTransfers[t].displayName !== undefined && recentTransfers[t].displayName.search(new RegExp(element.val(), 'i')) != -1 || recentTransfers[t].primaryExtension.search(new RegExp(element.val(), 'i')) != -1 || recentTransfers[t].phoneMobile.search(new RegExp(element.val(), 'i')) != -1 || recentTransfers[t].phoneBusiness.search(new RegExp(element.val(), 'i')) != -1){
              var line2 = makeLine(recentTransfers[t], false, t);
              recentTransferRows.append(line2);
              inset.append(recentTransferHeader);
              inset.append(recentTransferRows);
              transferMatchCount++;
            }
          }

          // if no matches for both...
          if(contactMatchCount == 0){
            // if a phone #...
            var line = makeLine(null, true);
            inset.empty();
            rows.empty();
            rows = line;
            // if yes contact match but no recent match
          } else if (contactMatchCount > 0 && transferMatchCount == 0){
            recentTransferHeader.remove();
            recentTransferRows.remove()
          }
          inset.append(contactsHeader);
          inset.append(rows);
          overlay.append(inset);
          element.after(overlay);
        }
      });
      
      element.bind('click', function(e) {
        e.stopPropagation();
      });
      
      // clear search
      element.bind('search', function(e) {
        if (element.val().length == 0) {
          rows.empty();
          inset.empty();
          overlay.remove();
        }

      });

      
      // create overlay properties one-time
      function overlayProperties() {
        // add some paddin'
        if (element.prop('offsetWidth') == overlay.prop('offsetWidth') || element.prop('offsetLeft') == overlay.prop('offsetLeft')) {
          overlay.css('left', '-10px');
          overlay.css('width', overlay.prop('offsetWidth') + 20 + 'px');
        }
        
        if (element.prop('offsetTop') == overlay.prop('offsetTop'))
          overlay.css('top', '-10px');
      
        // prevent accidental closing
        overlay.bind('click', function(e) {
          e.stopPropagation();
        });
      
        // close overlay for reals
        $document.bind('click', function(e) {
          if(e.target != overlay)
          { 
            inset.empty();
            rows = angular.element('<div class="rows"></div>');
            element.val('');
            overlay.remove();
          }
        });
        
        added = true;
      }

      var fullContactInfo = function(line, contact){
        line.append('<div class="Avatar AvatarSmall"><img src="' + contact.getAvatar(14) + '" onerror="this.src=\'img/Generic-Avatar-14.png\'" /></div>');
        var hud_status = contact.hud_status || 'offline';
        var name = '<div class="ListRowContent"><div class="ListRowTitle">';
        name += '<div class="name"><strong>' + contact.displayName + '</strong></div>';
        name += '<div class="hudStatus"><div class="ListRowStatusIcon XIcon-ChatStatus-'+ hud_status +'"></div>';
        name +=  contact.custom_status ? contact.custom_status : contact.hud_status ? contact.hud_status : 'offline';
        name += '</div></div><div class="ListRowStatus"><div class="Extension Link">#' + contact.primaryExtension + '</div></div></div>';
        line.append(name);
      };

      // fill row content
      function makeLine(contact, joinByPhone, idx) {
        
        // if external #
        if (joinByPhone){
          var line = angular.element('<div class="ListRow"></div>');
          line.append('<div class="Avatar AvatarSmall"><img src="img/Generic-Avatar-14.png"/></div>');        
          var name = '<div class="ListRowContent"><div class="ListRowTitle">';
          name += '<div class="name"><strong>Unknown number</strong></div>';
          if (!isNaN(element.val())){
            name += '<div class="">' + element.val() + '</div>';
          } else{
            name += '<div class="">Please enter a valid number</div>';
          }
          line.append(name);

          // internal contact
        } else {
          if (contact){
            var line = angular.element('<div class="ListRow"></div>');
            var name = fullContactInfo(line, contact);
          } else {
            line = angular.element('');
          }
        }
          
        // send contact to parent scope
        line.bind('click', function() {
          // if adding members to a conference...
          if (contact){
            if (contact.xpid){
              scope.searchContact(contact);
            }
          } else if (!isNaN(element.val())){
            // need to define this function in call status over controller
            scope.addExternalToTransfer(element.val());
          } else {
            return;
          }

          element.val('');
          rows.empty();         
          overlay.remove();
        });
        
        line.on('$destroy', function() {
          line.empty().unbind('click');
        });
        
        return line;
      }
      
      
      scope.$on('$destroy', function() {
        $document.unbind('click');
        rows.empty();       
        overlay.unbind().remove();
      });
    }
  };
}]);