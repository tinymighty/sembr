define(['sembr', 'backbone', 'backbone.pouch', 'underscore', 
    './layout/module.js', './default/module.js', './trackr/module.js'], 
function(Sembr, Backbone, BackbonePouch, _, layoutModule, defaultModule, trackrModule){
	   //this will be a module router eventually

    Backbone.sync =  BackbonePouch.sync({
      db: PouchDB('sembr')
    });
    Backbone.Model.prototype.idAttribute = '_id';

    Sembr.vent.on('all', function(){
    	console.log("Sembr event: ", arguments);
    });
    Sembr.start();


});

window.PUTON_HOST = 'http://sembr.dev:8001/libs/puton/'