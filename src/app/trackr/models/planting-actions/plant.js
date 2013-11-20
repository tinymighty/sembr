define(["sembr", 'sembr.model', 'trackr/models/planting-action'],
function(sembr, Model, Action) {
    // Creates a new Backbone Model class object
    var PlantingAction = Action.extend({

        // Default values for all of the Model attributes
        defaults: _({}).extend(Action.prototype.defaults, {
            type: 'action',
            action_type: undefined,
            subject_type: 'planting',
            subject_id: undefined,
            order: 0
        }),

        action_types: [
            'plant', 'sow', 'transplant',
            'harvest', 'dig in',
            'fertilize', 'spray',
            'prune', 
        ],

        test: {
            in: ['plant', 'sow', 'transplant']
            out: ['harvest', 'dig in']
            tend: ['fertilize', 'spray', 'prune']
        },

        initialize: function(attrs, options){
            Action.prototype.initialize.apply(this, arguments);
            if(attrs && attrs.action_type){

            }
        },

        // Get's called automatically by Backbone when the set and/or save methods are called (Add your own logic)
        validate: function(attrs) {
            return Action.prototype.validate.apply(this, arguments);
        },


    });

    PlantingAction.create = function(){
        
    };

    // Returns the Model class
    return PlantingAction;

});