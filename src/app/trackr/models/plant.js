define(["sembr", 'sembr.model'],
function(sembr, Model) {
    // Creates a new Backbone Model class object

    var Plant = Model.extend({
        type: 'plant',
        
        defaults: {
          use_name: undefined, //the name by which the user refers to this plant
          binomial: undefined, //the binomial (eg. Malus domestica)
        },

        plantingsCollectionOptions: function(){
            return { plant_id: this.get('_id') };
        }

    });

    // Returns the Model class
    return Plant;
});