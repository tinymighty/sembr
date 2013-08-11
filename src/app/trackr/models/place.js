define(["jquery", "backbone", 'backbone.pouch', 'backbone.relational'],
    function($, Backbone, Pouch, RM) {
        // Creates a new Backbone Model class object
        var Place = Backbone.RelationalModel.extend({

            // Model Constructor
            initialize: function() {

            },

            // Default values for all of the Model attributes
            defaults: {
                type: 'place',
                order: 0
            },

            // Get's called automatically by Backbone when the set and/or save methods are called (Add your own logic)
            validate: function(attrs) {
                if(attrs.type!=='place'){
                    throw {error: 'type property must be action'};
                }
                if(!attrs.name){
                    throw {error: 'name property must be set'};
                }
            }

        });

        // Returns the Model class
        return Place;

    }

);