namespace('fjs.hud.filter');

fjs.hud.filter.SortVoicemailFilter = function() {
    return function(items, mode) {
        var res =  items.slice(0);
        /**
         *
         * @param voicemail1 {VoicemailMessageEntryModel}
         * @param voicemail2 {VoicemailMessageEntryModel}
         */
        var compareFn;
        switch (mode){
            case 'alphabetically':
                compareFn = function(conf1, conf2){
                    var diff = conf1["roomNumber"] - conf2["roomNumber"];
                    if(diff)
                    {
                        return diff;
                    }
                    diff = (conf1.isMyServer() ? 0 : 1) - (conf2.isMyServer() ? 0 : 1);
                    if(diff != 0)
                    {
                        return diff;
                    }

                    return conf1.getServerName().localeCompare(conf2.getServerName());
                };
                break;
            case 'oldest':
                compareFn = function(conf1, conf2){
                    var diff = (conf1.getMembersCount() > 0 ? 0 : 1) - (conf2.getMembersCount() > 0 ? 0 : 1);
                    return diff||conf1.compareTo(conf2);
                };
                break;
            case 'readStatus':
                compareFn = function(conf1, conf2){
                    var diff = (conf1.getMembersCount() > 0 ? 0 : 1) - (conf2.getMembersCount() > 0 ? 0 : 1);
                    return diff||conf1.compareTo(conf2);
                };
                break;            case 'newest':
            default:
                compareFn = function(conf1, conf2){
                    return conf1.compareTo(conf2);
                };

                break;
        }
        res.sort(compareFn);
        return res;
    };
};