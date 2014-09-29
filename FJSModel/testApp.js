require.config({
    paths: {
        'fjscore':'bower_components/FJSCore/dest/amd/fjs.core.debug',
        'fjsmodel':'dest/amd/fjs.model.debug'
    }
});
require(
    ['fjsmodel'],
    function(fjsmodel){
        console.log(fjsmodel);
    }
);