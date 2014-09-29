require.config({
    paths: {
        'fjscore':'bower_components/FJSCore/dest/amd/fjs.core.debug',
        'fjsutils':'bower_components/FJSCore/dest/amd/fjs.utils.debug',
        'fjsdb':'dest/amd/fjs.db.debug'
    }
});
require(
    ['fjsdb'],
    function(fjsdb){
        console.log(fjsdb);
    }
);