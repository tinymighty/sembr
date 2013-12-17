define(["sembr", 'sembr.base', 'sembr.model', 'base/models/user'],
function(sembr, base, Model, User) {
    // Creates a new Backbone Model class object

    _(base.models.User).extend({

        type: 'user',

        // Default values for all of the Model attributes
        defaults: {
            type: 'user'
        },

        // Get's called automatically by Backbone when the set and/or save methods are called (Add your own logic)
        validate: function(attrs) {
            if(attrs.type!=='user'){
                throw {error: 'type property must be plant'};
            }
        },


        relatedDocs:[

            {
                target: 'plantings',
                key: 'plant_id',
                source: 'remote',
                autoFetch: false,
                query: {
                    map: function(doc){
                        if(doc.type==='planting'){
                            emit([doc.plant_id], null);
                        }
                    },
                    options: function( docs, collection ){
                        return {
                            keys: _(docs).pluck('_id')
                        }
                    }
                }
            }
        ]

    });
    
    return User;
});