define(["jquery", "backbone", 'backbone.pouch', 'backbone.relational', 
'../models/place.js', '../models/action.js', '../collections/planting-actions.js', '../collections/places.js'],
function($, Backbone, Pouch, RM, Place, Action, PlantingActionsCollection, PlacesCollection) {
    // Creates a new Backbone Model class object
    var Planting = Backbone.RelationalModel.extend({

        relations: [{
            type: Backbone.HasOne,
            key: 'place',
            relatedModel: Place
        }],

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

        /*fetchRelatedJSON: function(){
            PlantingsCollection.prototype.fetchRelatedJSON(this.attributes).then(function(res){
                this.set(res);
            }.bind(this));
        }*/

        /*fetchPlace: function(){
            return new PlacesCollection({ _id: this.get('place') }).fetch().then( function(places){
                this.place = places.get( {'_id': this.get('place') }  );
            } );
        }*/

    });

    // Returns the Model class
    return Planting;

});