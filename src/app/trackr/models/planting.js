define(['sembr', 'sembr.model', 'moment'],
function(sembr, Model, moment) {
	// Creates a new Backbone Model class object
	var parent = Model.prototype;

	var normalize_date = function( value ){
    return moment(value).isValid() ? moment(value).toISOString() : value;
  }

	var Planting = Model.extend({
		type: 'planting',

		defaults: {
			type: 'planting',
			status: 'current', //past, current or future
			propagated_from: 'seed', //seed, plant, cutting
			derived_from_planting_id: null,
			plant_id: null,
			place_id: null,
			planted_from:null, //date it (will be|has been) planted
			planted_until:null //date it (will be|has been) planted until
		},

    validation: {
      type: {
        oneOf: ['planting']
      },
      plant_id: function( value, attr, computedState ){
				if( !value || !sembr.trackr.models.Plant.find({'id': value}) ){
					return 'Invalid Plant ID';
				}
			},
	    place_id: function( value, attr, computedState ){
				if( !value || !sembr.trackr.models.Place.find({'id': value}) ){
					return 'Invalid Place ID';
				}
			},
	    planted_from: function( value, attr, computedState ){
	      console.log('Validating planted_from date %o', value);
	    	if( !value || !moment( value ).isValid() ){
	    		return 'Invalid start date: '+moment(value).format();
	    	}
	    },
	    planted_until: function( value, attr, computedState ){
	    	if( !value || !this.get('planted_from') || !moment(value).isValid() || new Date(value) < new Date(computedState.planted_from) ){
	    		return 'Invalid end date';
	    	}
	    },
	    harvest: function( value, attr, computedState ){
	    	/*var err = _(value).any(function(h){ 
	    		if 
	    	}); 
	    	if( err ){
	    		return 'Invalid harvest!';
	    	} */
	    }
	  },

		initialize: function(attrs, options){
			parent.initialize.apply(this, arguments);
		},

		/* Filter functions to ensure attribute consistency */
	  filters:{
	  	planted_from: function( value ){
		  	return normalize_date( value );
		  },

		  planted_until: function( value ){
		  	return normalize_date( value );
		  },
		},


		addAction: function( type, data ){
			data = data || {};
			var id = this.id || this.cid;
			var action = sembr.trackr.models.PlantingAction.create({
				action_type: type,
				subject_id: id
			});
			//this.actions().add( action );
			return action;
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