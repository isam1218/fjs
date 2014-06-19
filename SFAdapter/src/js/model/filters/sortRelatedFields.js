/**
 * Created by vovchuk on 04.06.2014.
 */
namespace("fjs.model.filter");
fjs.model.filter.SortRelatedFields = function() {
    return function(items) {
        items.sort(function(a, b){
            if(a.object> b.object) return 1;
            else if(a.object < b.object) return -1;
            else {
                if(a.Name.toLowerCase() > b.Name.toLowerCase()) return 1;
                else if (a.Name.toLowerCase() < b.Name.toLowerCase()) return -1;
            }
            return 0;
        });
        var lastTitle = null, rootItem=null, count=0;
        items.forEach(function(item){
            if(lastTitle!=item.object) {
                count = 0;
                lastTitle = item.object;
                rootItem = item;
            }
            else {
                item.title = "";
            }
            count++;
            rootItem.title = lastTitle + " (" + count + ")";
        });
    };
};