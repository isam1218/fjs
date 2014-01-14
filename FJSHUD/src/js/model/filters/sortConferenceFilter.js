namespace('fjs.hud.filter');

fjs.hud.filter.SortConferenceFilter = function() {
    return function(items, mode) {
        var res =  items.slice(0);
        /**
         *
         * @param conf1 {ConferenceEntryModel}
         * @param conf2 {ConferenceEntryModel}
         */
        var compareFn;
        switch (mode){
            case 'number':
                compareFn = function(conf1, conf2){
                    var diff = conf1.roomNumber - conf2.roomNumber;
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
                }
                break;
            case 'activity':
                compareFn = function(conf1, conf2){
                    var diff = (conf1.getMembersCount() > 0 ? 0 : 1) - (conf2.getMembersCount() > 0 ? 0 : 1);
                    return diff||conf1.compareTo(conf2);
                }
                break;
            case 'location':
            default:
                compareFn = function(conf1, conf2){
                    return conf1.compareTo(conf2);
                }

                break;
        }
        res.sort(compareFn);
        return res;
    };
};