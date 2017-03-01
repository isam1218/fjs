hudweb.filter('SortVoiceMail',['ContactService','$rootScope', function(contactService,$rootScope) {
    return function(items,type,desc) {
        switch(type){
            case 'displayName':
                items.sort(function(a,b){
                    return a.displayName < b.displayName ? -1 : a.displayName > b.displayName ? 1 : 0
                })
                break;
            case 'date':
                if(desc){
                    items.sort(function(a,b){
                        return b.date - a.date;
                    });
                }else{
                    items.sort(function(a,b){
                        return a.date - b.date;
                    });

                }
                break;
            case 'readStatusNum':
                    me = $rootScope.meModel;
                    otherItems = items.filter(function(a){
                        return a.readStatus || (!a.readStatus && (a.phone == me.primary_vm_box));
                    });
                    
                    unreadItems = items.filter(function(a){
                       return !a.readStatus && (a.phone != me.primary_vm_box) ; 
                    });
                    
                    

                   otherItems.sort(function(a,b){
                       return b.date - a.date ; 
                    });
                    unreadItems.sort(function(a,b){
                        return b.date  - a.date;
                    });
                    
                    items = unreadItems.concat(otherItems);                  
                    break;
        }

        return items;
    };
}]);