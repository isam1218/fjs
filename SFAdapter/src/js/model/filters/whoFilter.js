/**
 * Created by vovchuk on 04.06.2014.
 */
namespace("fjs.model.filter");
fjs.model.filter.Who = function() {
    return function(items) {
        return items.filter(function(element) {
            return element.object == 'Contact' || element.object == 'Lead';
        });
    };
};