define(['require', 'jquery', 'sembr', 'backbone', 'marionette', 'trackr/router', 'trackr/models/_init', 'trackr/collections/_init'], 
function(require, $, sembr, Backbone, Marionette, Router, models, collections){

var Trackr = sembr.module("trackr", function(module){

  module.models = models;

  module.collections = collections;



  module.on('before:start', function(){
    module.addRouter( new Router({ module: module }) )
  });

  //since places are needed quite regularly and is a nested tree
  //load the nested collection here and make it available at the module level
  module.addAsyncInitializer(function(){
    console.log('Running async initializer for places collection...');
  	var deferred = new $.Deferred();
    console.log('Querying for user places...');
  	return new module.collections.Places()
  		.fetchWhere( {'user': sembr.user.get('_id')} )
  		.done(function(places, data){
        console.log('Sweet cheese the places have been fetched yall', places);
  			Trackr.places = places;
  			deferred.resolve(places)
  		})
  		.fail(function(err){
  			deferred.reject(err);
  		});
  });

  module.on('start', function(){

  });
  
  //bubble router events (adding a module parameter)
  
});

return Trackr;

});