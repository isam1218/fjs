require.config({
    paths: {
        'fjscore':'bower_components/FJSCore/dest/amd/fjs.core.debug',
        'fjsutils':'bower_components/FJSCore/dest/amd/fjs.utils.debug',
        'fjsmodel':'bower_components/FJSModel/dest/amd/fjs.model.debug',
        'fjsdb':'bower_components/FJSDB/dest/amd/fjs.db.debug',
        'fjstabs':'dest/amd/fjs.tabs.debug'
    }
});
require(
    ['fjstabs'],
    function(fjstabs){
        console.log(fjstabs);
    }
);