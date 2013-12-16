define(["sembr", 'sembr.model'],
function(sembr, Model) {
    // Creates a new Backbone Model class object

    var Plant = Model.extend({
        _type: 'plant',

        plantingsCollectionOptions: function(){
            return { plant_id: this.get('_id') };
        },

        // Default values for all of the Model attributes
        defaults: {
            type: 'plant'
        },

        // Get's called automatically by Backbone when the set and/or save methods are called (Add your own logic)
        validate: function(attrs) {
            if(attrs.type!=='plant'){
                throw {error: 'type property must be plant'};
            }
        },


        relatedDocs:[

            /*{
                target: 'plantings',
                key: 'plant_id',
                source: 'remote',
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
            }*/
        ]
    });

    // Returns the Model class
    return Plant;
});