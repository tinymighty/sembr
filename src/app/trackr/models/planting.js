define(['sembr', 'sembr.model'],
function(sembr, Model) {
	// Creates a new Backbone Model class object

	var Planting = Model.extend({
		type: 'planting',

		defaults: {
			type: 'planting',
			status: 'current', //past, current or future
			from: 'seed', //seed, plant, cutting
			from_planting_id: null,
			plant_id: null,
			place_id: null,
			planted_on:null,
			removed_on:null
		},

		initialize: function(attrs, options){
			if(attrs){
				//attrs = _(attrs).defaults(this.defaults);
				if(!attrs.id){
					this.created = new Date().toString();
				}
			}
			Model.prototype.initialize.apply(this, arguments);
		},

		__set_created: function(value){
			return this.attributes.created = (value instanceof Date) ? Date.toString() : value;
		},
		__get_created: function(){
			return new Date(this.attributes.created);
		},

		// Get's called automatically by Backbone when the set and/or save methods are called (Add your own logic)
		validate: function(attrs) {
			sembr.log("VALIDATING ATTRS", attrs);
			if(attrs.type!=='planting'){
				throw sembr.error('type property must be planting');
			}
			if(!attrs.plant_id){
				throw sembr.error('plant_id is not defined');
			}
		},

		serialized: {
			planted_on: 'date',
			removed_on: 'date',
			created_at: 'date',
			updated_at: 'date',
			place_id: {	
				in: 	function(id){ return this.place() && this.place().get('id') || id }, 
				out: 	function(id){ return id; }
			},
			plant_id: {
				in: 	function(id){ return this.plant() && this.plant().get('id') || id },
				out: 	function(id){ return id; }
			}
			//place_id: ['association', {name: 'place'}],
			//plant_id: ['association', {name: 'plant'}]
		}

	});

	// Returns the Model class
	return Planting;
});