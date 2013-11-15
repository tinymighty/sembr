define(['require', 'jquery', 'sembr', 'backbone', 'marionette', '/app/trackr/router.js',
  '/app/trackr/models/action.js', '/app/trackr/models/place.js', '/app/trackr/models/plant.js', '/app/trackr/models/planting.js',
  '/app/trackr/collections/places.js', '/app/trackr/collections/planting-actions.js', '/app/trackr/collections/plantings.js', '/app/trackr/collections/plants.js'], 
function(require, $, Sembr, Backbone, Marionette, Router,
  ActionModel, PlaceModel, PlantModel, PlantingModel,
  PlacesCollection, PlantingActionsCollection, PlantingsCollection, PlantsCollection){

var Trackr = Sembr.module("trackr", function(module){

  module.addInitializer(function(){
    console.log('Trackr module has been initialized.');
  });

  module.models = {
    Action: ActionModel,
    Place: PlaceModel,
    Plant: PlantModel,
    Planting: PlantingModel
  }

  module.collections = {
    Places: PlacesCollection,
    PlantingActions: PlantingActionsCollection,
    Plantings: PlantingsCollection,
    Plants: PlantsCollection
  }

  Backbone.Relational.store.addModelScope( module.models );
  Backbone.Relational.store.addModelScope( module.collections );

  module.on('before:start', function(){
    console.log("Initializing router for Trackr module")
    module.addRouter( new Router({ module: module }) )
  });

  console.log('Which module yo', module);

  //since places are needed quite regularly and is a nested tree
  //load the nested collection here and make it available at the module level
  module.addAsyncInitializer(function(){
    console.log('Running async initializer for places collection...');
  	var deferred = new $.Deferred();
    require(['/app/trackr/collections/places.js'], function(Places){
      console.log('Querying for user places...');
    	new Places()
    		.fetchWhere( {'user': Sembr.user.get('_id')} )
    		.done(function(places){
          console.log('Sweet cheese the places have been fetched yall', places);
    			Trackr.places = places;
    			deferred.resolve(places)
    		})
    		.fail(function(err){
    			deferred.reject(err);
    		});
    });
    return deferred.promise();
  });

  module.on('start', function(){
  	console.info('Trackr module is ready. Routing...');
  	;
  });
  
  //bubble router events (adding a module parameter)
  
});

return Trackr;

});