define(['sembr', 'sembr.model'],
    function(sembr, Model) {
        //first we have to define Place so we can reference it within its own relation property
        //to set up a self-nested hierarchy 
        Place = Model.extend({
            type: 'place',

            default_place_types:[
                'garden',
                'greenhouse',
                'orchard',
                'patio',
                'plot',
                'propagator',
                'seedbed',
                'terrace'
            ],

            // Model Constructor
            initialize: function() {
                Model.prototype.initialize.apply(this, arguments);
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
            },

            /**
             * Returns true if there is a planting currently assigned to this place
             * ie. it has a start date before the current time, and end date after...
             */
            isPlanted: function(){
                var d = new Date();
                //why the hell does date.getMonth start at 0?
                var today = d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();

                //we have to assume all relevant plantings are currently loaded.
                return this.plantings().filter(function(planting){
                    return planting.from < d.getFullYear() && planting.until > today;
                }).length > 0;

            },

            loadPlantings: function(){
                var plantings = new sembr.trackr.collections.Plantings();
                //plantings.fetchWhere
            },

            toJSON: function(){
                var json = Model.prototype.toJSON.apply(this, arguments);
                json.isPlanted = this.isPlanted();
                return json;
            }
            
        });

        // Returns the Model class
        return Place;
    });