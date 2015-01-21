fjs.hud.filter.ContactVoicemails = function() {
    return function(items, contactId) {
        var arr = [] ;
        if(items && items.length > 0){
           for(i in items){

                if(items[i].contactId == contactId){
                    arr.push(items[i]);
                }
           } 
        }
        return arr;
    };
};