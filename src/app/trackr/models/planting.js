define(["jquery", "backbone", 'backbone.pouch', 'backbone.deep-model', '../collections/planting-actions.js', '../collections/places.js'],
    function($, Backbone, Pouch, DM, PlantingActionsCollection, PlacesCollection) {
        // Creates a new Backbone Model class object
        var Planting = Backbone.DeepModel.extend({

            // Model Constructor
            initialize: function() {

            },

            // Default values for all of the Model attributes
            defaults: {
                type: 'planting'
            },

            // Get's called automatically by Backbone when the set and/or save methods are called (Add your own logic)
            validate: function(attrs) {
                if(attrs.type!=='planting'){
                    throw {error: 'type property must be planting'};
                }
            },

            fetchActions: function(){
                return new PlantingActionsCollection({ planting_id: this.get('_id') }).fetch().then( _(function(actions){
                    this.actions = actions;
                }).bind(this));
            },

            fetchPlace: function(){
                return new PlacesCollection({ _id: this.get('place') }).fetch().then( function(places){
                    this.place = places.get( {'_id': this.get('place') }  );
                } );
            }

        });

        // Returns the Model class
        return Planting;

    }

);