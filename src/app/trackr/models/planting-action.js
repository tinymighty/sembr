define(["sembr", 'sembr.model', 'trackr/models/action'],
function(sembr, Model, Action) {

	var normalize_date = function( value ){
  	return moment(value).isValid() ? moment(value).toISOString() : value;
  }

	// Creates a new Backbone Model class object
	var PlantingAction = Action.extend({

		parent: Action,
		
		// Default values for all of the Model attributes
		defaults: _({
			type: 'action',
			action_type: undefined,
			subject_type: 'planting',
			subject_id: undefined,

			from: undefined,
			until: undefined,
			order: 0
		}).defaults( Action.prototype.defaults ),

		/* Filter functions to ensure attribute consistency */
		filters:{
			from: function( value ){
				return normalize_date( value );
			},

			until: function( value ){
				return normalize_date( value );
			},
		},

		action_types: [
			'plant', 'sow', 'transplant',
			'harvest', 'dig in',
			'fertilize', 'spray',
			'prune', 
			'observe'
		],

		action_type_groups: {
			in: ['plant'],
			out: ['transplant', 'remove', 'harvest', 'dig in'],
			tend: ['fertilize', 'spray', 'prune'],
			misc: ['observation']
		},

		action_type_values:{
			plant: {
					from: ['seed', 'plantling', 'cutting']
			},
			transplant:{
					//quantity, to_place_id,
			},
			harvest: {

			}
		},

		/*initialize: function(attrs, options){
				Action.prototype.initialize.apply(this, arguments);
				if(attrs && attrs.action_type){

				}
		},

		// Get's called automatically by Backbone when the set and/or save methods are called (Add your own logic)
		validate: function(attrs) {
				return Action.prototype.validate.apply(this, arguments);
		},
*/

	});

	// Returns the Model class
	return PlantingAction;

});