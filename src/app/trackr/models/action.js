define(["jquery", "backbone", 'backbone.pouch'],
    function($, Backbone, Pouch) {
        // Creates a new Backbone Model class object
        var Planting = Backbone.Model.extend({

            // Model Constructor
            initialize: function() {

            },

            // Default values for all of the Model attributes
            defaults: {
                type: 'action',
                order: 0
            },

            // Get's called automatically by Backbone when the set and/or save methods are called (Add your own logic)
            validate: function(attrs) {
                if(attrs.type!=='action'){
                    throw {error: 'type property must be action'};
                }
                if(!attrs.action_type){
                    throw {error: 'action_type property must be set'};
                }
                if(!attrs.subject_type){
                    throw {error: 'subject_type property must be set'};
                }
                if(!attrs.subject_id){
                    throw {error: 'subject_id property must be set'};
                }
            }

        });

        // Returns the Model class
        return Planting;

    }

);