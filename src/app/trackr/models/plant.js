define(["sembr", 'sembr.model'],
function(sembr, Model) {
    // Creates a new Backbone Model class object

    var Plant = Model.extend({
        type: 'plant',

        plantingsCollectionOptions: function(){
            return { plant_id: this.get('_id') };
        }

    });

    // Returns the Model class
    return Plant;
});