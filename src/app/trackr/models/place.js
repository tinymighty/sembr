define(['sembr', 'sembr.model', "backbone", 'backbone.pouch',
    '../models/planting.js', '../collections/plantings.js'],
    function(sembr, Model, Backbone, Pouch,
        Planting, PlantingsCollection) {
        //first we have to define Place so we can reference it within its own relation property
        //to set up a self-nested hierarchy 
        var Place = function () {
            Model.apply(this, arguments);
        };
        Place = Model.extend({
            constructor: Place,

            docType: 'place',

            // Model Constructor
            initialize: function() {

            },

            relations: [{
                type: Backbone.HasMany,
                key: 'places',
                relatedModel: Place,
                reverseRelation:{
                    key: 'in_place'
                },
                parse:true
            }/*,{
                type: Backbone.HasMany,
                key: 'plantings',
                relatedModel: 'Planting',
                reverseRelation:{
                    key: 'place_id'
                },
                collectiontype: 'Plantings',
                collectionOptions: this.plantingsCollectionOptions,
                parse:true
            }*/],


            relatedDocs:[
                {
                    target: 'place',
                    key: 'in_place'
                },
                {
                    target: 'places',
                    key: 'in_place',
                    source: 'remote',
                    query: {
                        map: function(doc){
                            if(doc.type==='place' && doc.in_place){
                                emit([doc.in_place], null);
                            }
                        },
                        //options will be passed an array of place documents before they have been used to initialize
                        //models on this collection
                        options: function( docs, collection ){
                            console.log('Building options', docs, collection);
                            return {
                                keys: _(docs).pluck('_id')
                            }
                        }
                    }
                }
            ],

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
            
        });

        // Returns the Model class
        return Place;
    });