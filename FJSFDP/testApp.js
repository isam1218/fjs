require.config({
    paths: {
        'fjscore':'bower_components/FJSCore/dest/amd/fjs.core.debug',
        'fjsajax':'bower_components/FJSCore/dest/amd/fjs.ajax.debug',
        'fjsutils':'bower_components/FJSCore/dest/amd/fjs.utils.debug',
        'fjsmodel':'bower_components/FJSModel/dest/amd/fjs.model.debug',
        'fjsdb':'bower_components/FJSDB/dest/amd/fjs.db.debug',
        'fjstabs':'bower_components/FJSTabs/dest/amd/fjs.tabs.debug',
        'fjsfdp':'dest/amd/fjs.fdp.debug'
    }
});
require(
    ['fjsfdp'],
    function(fjsfdp){
        console.log(fjsfdp);
    }
);