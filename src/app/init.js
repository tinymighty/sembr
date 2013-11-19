define(['sembr', 'sembr.base', 'sembr.default', 'sembr.trackr'], 
function(sembr, layoutModule, defaultModule, trackrModule){
	
    sembr.vent.on('all', function(){
    	//console.log("Sembr event: ", arguments);
    });
    //try{
        sembr.start();
    //}catch(err){
      //  console.error("Fail.", err);
    //}


});

window.PUTON_HOST = 'http://sembr.dev:8001/libs/puton/';