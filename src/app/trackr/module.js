define(['require', 'jquery', 'sembr', 'backbone', 'marionette', 
  'trackr/router', 'trackr/controllers/_init', 'trackr/models/_init', 'trackr/collections/_init'], 
function(require, $, sembr, Backbone, Marionette, 
  Router, controllers, models, collections){

  "use strict";
  
  var Trackr = sembr.module("trackr", function(module){

    module.controllers = controllers;

    module.models = models;

    module.collections = collections;

    module.addRouter( new Router({ module: module }) )

    module.isDependentOn('base');

    module.on('before:start', function(){
      
    });

    //since places are needed quite regularly and is a nested tree
    //load the nested collection here and make it available at the module level
    module.addAsyncInitializer(function(){
      sembr.log('Running async initializer for places collection...');
    	return new module.collections.Places()
    		.fetch( )
    		.done(function(places, data){
          console.warn("Places loaded", places, data);
    			Trackr.places = places;

          //only show top level places, the rest are accessed via the tree
          Trackr.placesTree = new module.collections.Places( 
            places.filter(function(place){
              if(place.has('in_place'))
                return false;
              return true;
            })
          );

    		})
      ;
    });

    module.addAsyncInitializer(function(){
      sembr.log('Running async initializer for plantings collection...');
      return new module.collections.Plantings()
        .fetch( )
        .done(function(plantings, data){
          console.warn("Plantings loaded", plantings, data);
          Trackr.plantings = plantings;
        })
      ;
    });

    module.addAsyncInitializer(function(){
      sembr.log('Running async initializer for plants collection...');
      return new module.collections.Plants()
        .fetch( )
        .done(function(plants, data){
          console.warn("Plants loaded", plants, data);
          Trackr.plants = plants;
        })
      ;
    });

    
  });

  return Trackr;

});