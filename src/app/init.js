define(['jquery', 'underscore', 
        'sembr', 'sembr.base', 'sembr.default', 'sembr.trackr'], 
function($, _, 
        sembr, layoutModule, defaultModule, trackrModule){
	
    function init(options){
        var envDefaults = {
            development:{
                log: true,
                global: true
            },
            production:{
                log: false,
                global: false
            }
        }

        options = _(options || {}).defaults({
            environment: 'production'
        });
        options = _(options).defaults(envDefaults[options.environment]);

        //try{
            sembr.start(options);
        //}catch(err){
          //  console.error("Fail.", err);
        //}

        if(options.global && window){
            window.sembr = sembr;
        }

        return sembr;
    }

    return init;
});

window.PUTON_HOST = 'http://sembr.dev:8001/libs/puton/';