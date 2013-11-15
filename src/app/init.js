define(['sembr',  
    './layout/module.js', './default/module.js', 'sembr.trackr'], 
function(Sembr, layoutModule, defaultModule, trackrModule){
	
    Sembr.vent.on('all', function(){
    	//console.log("Sembr event: ", arguments);
    });
    //try{
        Sembr.start();
    //}catch(err){
      //  console.error("Fail.", err);
    //}


});

window.PUTON_HOST = 'http://sembr.dev:8001/libs/puton/';