namespace("fjs.ui");

fjs.ui.SortableController = function($scope, dataManager, sortingKey, defaultSortMode, sortMenuItems, sortClb) {
    fjs.ui.Controller.call(this, $scope);
    var context = this;
    this.sortingKey = sortingKey;
    this.defaultSortMode = defaultSortMode;
    this.selectedSortMode = undefined;
    this.sortMenuItems = sortMenuItems;//Example: {alphabetically:"Alphabetically", newest: "Newest First", oldest: "Oldest First", readStatus: "Read Status"};
    this.sortClb = sortClb;

    var sortChangeListener = function(data){
        context.selectedSortMode = data.entry.value;
        if(context.sortClb){
            context.sortClb();
        }
        $scope.$safeApply(function(){
            $scope.sortedBy = context.getSortedByName();
        });
    };
    var /** @type{fjs.hud.SortingFeedModel}*/ sortModel =  dataManager.getModel("sortings");

    $scope.getSortMode = function(){
        return context.selectedSortMode || context.defaultSortMode;
    };
    this.setSortMode = function(sortMode){
        sortModel.actionSort(context.sortingKey, sortMode);
    };
    this.getSortedByName = function(){
        return this.sortMenuItems[$scope.getSortMode()]||this.sortMenuItems[this.defaultSortMode];
    };
    $scope.sortedBy = this.getSortedByName();
    $scope.showSortMenu = function(e) {
        e.stopPropagation();
        var items = [];
        for (var id in context.sortMenuItems){
            if(context.sortMenuItems.hasOwnProperty(id)){
                items.push({"id": id, "name": context.sortMenuItems[id], "selected": $scope.getSortMode() == id});
            }
        }
        var model = {};
        model.items = items;
        model.callback = context.setSortMode;
        var eventTarget = context.getEventHandlerElement(e.target, e);
        var offset = fjs.utils.DOM.getElementOffset(eventTarget);
        $scope.$emit("showPopup", {key:"SortMenuPopup", x:offset.x, y:offset.y+30, model: model, id:context.sortingKey});
        return false;
    };

    sortModel.addXpidListener(this.sortingKey, sortChangeListener);
    $scope.$on("$destroy", function() {
        dataManager.getModel("sortings").removeXpidListener(context.sortingKey, sortChangeListener);
    });

};
fjs.ui.SortableController.extend(fjs.ui.Controller);
