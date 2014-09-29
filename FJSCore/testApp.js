require.config({
    baseUrl:''
    , paths: {
        'fjscore':'dest/amd/fjs.core.debug'
        , 'fjsutils':'dest/amd/fjs.utils.debug'
        , 'fjsajax':'dest/amd/fjs.ajax.debug'
    }
});
require(
    ['fjscore', 'fjsutils', 'fjsajax'],
    function(core, utils, ajax){
        console.log(core);
        console.log(utils);
        console.log(ajax);
    }
);