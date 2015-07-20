hudweb.directive('transferContactSearch', ['$rootScope', '$document', 'ContactService', function($rootScope, $document, contactService) {
  var contacts = [];
  var recentTransfers = [];
  var recentXpids = [];

  contactService.getContacts().then(function(data) {
    contacts = data;
    if (localStorage['recentTransfers_of_' + $rootScope.myPid]){
      console.error('there is something stored!')
      // LS --> array of xpids
      recentXpids.push(JSON.parse(localStorage['recentTransfers_of_' + $rootScope.myPid]));
      console.error('recentXpids - ', recentXpids);
      for (var i = 0; i < data.length; i++){
        for (var j = 0; j < recentXpids.length; j++){
          if (data[i].xpid == recentXpids[j]){
            console.error('match! - ', data[i]);
            recentTransfers.push(data[i]);
          }
        }
      }
      console.error('recentTransfers [] - ', recentTransfers);
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
      inset = angular.element('<div class="Inset"></div>');
      inset.css('margin-top', rect.height*1.5 + 'px');
      
      var addTeamMemberHeader = function(){
        overlay = angular.element('<div class="SearchContactOverlay conferenceSearch"></div>');
        headerTitle = angular.element('<div class="Header">Add a Contact</div>');
        overlay.append(headerTitle);
      };
      
      // overlay = angular.element('<div class="SearchContactOverlay favoritesSearch"></div>');
      // headerTitle = angular.element('<div class="Header">Add a Contact</div>');
      // inset.append(headerTitle);

      addTeamMemberHeader();
      console.error('1');
      recentTransferHeader = angular.element('<div class="Header">Recent Transfers</div>');
      recentTransferRows = angular.element('<div id="recentTransferRows" class="rows"></div>');
      contactsHeader = angular.element('<div class="Header">Contacts</div>')
      rows = angular.element('<div class="rows"></div>');

      // search input
      element.bind('keyup', function(e) {
        if (added) {
          // console.error('2');
          // line.empty();
          recentTransferRows.empty();
          rows.empty();       
          overlay.remove();
        }

        // if user deletes search input, need to reset inset and create new rows div
        if (e.keyCode == 8 || e.keyCode == 46){
          console.error('!');
          inset.empty();
          addTeamMemberHeader();
          recentTransferHeader = angular.element('<div class="Header">Recent Transfers</div>');
          recentTransferRows = angular.element('<div id="recentTransferRows" class="rows"></div>');
          contactsHeader = angular.element('<div class="Header">Contacts</div>')
          rows = angular.element('<div class="rows"></div>');
        }
        
        if (element.val().length > 0) {
          // console.error('3');
            // inset.empty();
            // addTeamMemberHeader();
            // recentTransferHeader.empty();
            rows.empty();
            // recentTransferRows.empty();

          var matchCount = 0;
          // look for match
          for (var c = 0, len = contacts.length; c < len; c++) {
            // if search term matches item in contacts --> make line and add to rows
            if (contacts[c].xpid != $rootScope.myPid && contacts[c].displayName !== undefined && contacts[c].displayName.search(new RegExp(element.val(), 'i')) != -1 || contacts[c].primaryExtension.search(new RegExp(element.val(), 'i')) != -1 || contacts[c].phoneMobile.search(new RegExp(element.val(), 'i')) != -1 || contacts[c].phoneBusiness.search(new RegExp(element.val(), 'i')) != -1 ){
              // console.error('A');
              var line = makeLine(contacts[c], false, c);
              // need to add to both recent and regular
              rows.append(line);
              matchCount++;
            }
          // if no matches -> make line for phone number
          }
          if(matchCount == 0){
            var line = makeLine(null, true);
            inset.empty();
            rows.empty();
            // addTeamMemberHeader();
            // need to add to both recent and regular
            rows = line;
          }

          // headerTitle.remove();

          // addTeamMemberHeader();

          if (matchCount == 0 & !isNaN(element.val())){
            console.error('yyy');
            overlay = angular.element('<div class="SearchContactOverlay conferenceSearch"></div>');
            headerTitle = angular.element('<div class="Header">Add a Contact</div>');
            overlay.append(headerTitle);
          } else if (matchCount == 0 & isNaN(element.val())){
            console.error('zzz');
            // want to disable being able to click to add to transfer
            line.empty();
            overlay = angular.element('<div class="SearchContactOverlay conferenceSearch"></div>');
            headerTitle = angular.element('<div class="Header">Join to Conference</div>');
            overlay.append(headerTitle);
          }

          // line.empty();
          inset.append(recentTransferHeader);

          // inset.append(recentTransferRows);

          inset.append(contactsHeader);
          inset.append(rows);
          overlay.append(inset);
          element.after(overlay);
          console.error('4');

          // if(joinByPhoneBtn){
          //   joinByPhoneBtn.bind('click',function(){
          //     if (!isNaN(element.val())){
          //       scope.addExternalToConference(element.val());
          //       } 
          //   });
          // }
          
          if (!added)
            overlayProperties();
        }

        // !!!MIGHT NEED TO MESS WITH THESE CUZ WANT NO EXTRA LINES IF NO RECENT TRANSFER MATCHES!!!!!
        if (element.val().length > 0){
          // rows.empty();
          recentTransferRows.empty();
          var matchCount = 0;
          // if search term matches item in recentTransfers --> make line and add to recentTransferRows
          for (var t = 0; t < recentTransfers.length; t++){
            if (recentTransfers[t].xpid != $rootScope.myPid && recentTransfers[t].displayName !== undefined && recentTransfers[t].displayName.search(new RegExp(element.val(), 'i')) != -1 || recentTransfers[t].primaryExtension.search(new RegExp(element.val(), 'i')) != -1 || recentTransfers[t].phoneMobile.search(new RegExp(element.val(), 'i')) != -1 || recentTransfers[t].phoneBusiness.search(new RegExp(element.val(), 'i')) != -1){
              console.error('B');
              var line2 = makeLine(recentTransfers[t], false, t);
              recentTransferRows.append(line2);
              matchCount++;
            }
          }
          if(matchCount == 0){
            // HIDE recent transfers
            // recentTransferRows.empty();
            // inset.empty();
            console.error('101');

            // var line2 = makeLine(null, true);
            recentTransferHeader.empty();
            recentTransferRows.empty();

            // rows.empty();
            
            // addTeamMemberHeader();
            // need to add to both recent and regular
            // rows = line;

            line2 = angular.element('');

            recentTransferRows.append(line2);
            // recentTransferRows = line2;

          }
          console.error('102');

          // inset.empty();
          // recentTransferRows.empty();

          inset.append(recentTransferHeader);
          inset.append(recentTransferRows);
          inset.append(contactsHeader);
          inset.append(rows);
          overlay.append(inset);
          element.after(overlay);
          console.error('5');

          // if(joinByPhoneBtn){
          //   joinByPhoneBtn.bind('click',function(){
          //     if (!isNaN(element.val())){
          //       scope.addExternalToConference(element.val());
          //       } 
          //   });
          // }
          
          if (!added)
            overlayProperties();


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
        // return line;
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
            console.error('Q');
            var line = angular.element('<div class="ListRow"></div>');
            var name = fullContactInfo(line, contact);
          } else {
            console.error('W');
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