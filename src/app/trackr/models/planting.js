define(["jquery", "backbone", 'sembr.model'],//'./action.js', '../collections/planting-actions.js', './plant.js', '../collections/plants.js'],
function($, Backbone, SembrModel,  Action, PlantingActionsCollection, Plant, PlantsCollection) {
    // Creates a new Backbone Model class object

    /**
     * Document schema
     * 
     * _id
     *      Document UID
     * type
     *      Document type; "planting"
     * status
     *      Planting status; [current, past, future]
     * plant
     *      Plant document UID
     * place
     *      Place document UID
     * actions
     *      Array of planting action objects (eg. sowed, planted, harvested)
     */
    var Planting = SembrModel.extend({

        /*
        A Planting HasOne place via a reverse relation
        place: Place
        */

        relations: [{
            type: Backbone.HasMany,
            key: 'actions',
            relatedModel: 'Action',
            reverseRelation:{
                key: 'planting'
            },
            collectiontype: 'PlantingActions',
            collectionOptions: this.plantingActionsCollectionOptions,
            //parse:true
        }/*,
        {
            type: Backbone.HasOne,
            key: 'plant',
            relatedModel: 'Plant',
            reverseRelation:{
                key: 'plantings'
            },
            collectiontype: 'Plants',
            collectionOptions: this.plantsCollectionOptions,
            //parse:true
        },
        {
            type: Backbone.HasOne,
            key: 'place',
            relatedModel: 'Place',
            reverseRelation:{
                key: 'plantings'
            },
            collectiontype: 'Places',
            collectionOptions: this.plantsCollectionOptions,
            //parse:true
        }*/],

        plantingActionsCollectionOptions: function(){
            return {planting_id: this.get('_id')};
        },

        plantsCollectionOptions: function(){
            return {planting_id: this.get('_id')};
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


        relatedDocs:[
            {
                target: 'place',
                key: 'place_id'
            },
            {
                target: 'plant',
                key: 'plant_id'
            },
            {
                target: 'actions',
                key: 'subject_id',
                source: 'remote',
                query: {
                    map: function(doc){
                        if(doc.type==='action' && doc.subject_type==='planting'){
                            emit([doc.subject_id], null);
                        }
                    },
                    //options will be passed an array of planting documents before they have been used to initialize
                    //models on this collection
                    options: function( docs, collection ){
                        return {
                            keys: _(docs).pluck('_id')
                        }
                    }
                }
            }
        ],


        docType: 'planting'

    });

    // Returns the Model class
    return Planting;
});