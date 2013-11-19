define(["sembr", "underscore", "sembr.collection"],
  function(sembr, _, Collection) {
    var PlantingActions = Collection.extend({
		  
		  model: function(attrs, options) {
		    return sembr.trackr.models.Action.create(attrs, options);
		  },

	    initialize: function(options){
	    	Collection.prototype.initialize.apply(this, arguments);
	    	/*console.log("Initializing PlantingActions collection", this, options);
	    	var planting_id = options.planting_id || this.owner.id || undefined;
	    	if(planting_id){
		    	this.pouch.options.query.planting_id = planting_id;
		    	this.planting_id = planting_id;
		    }else{
		    	throw 'No planting_id provided to PlantingActions collection.';
		    }*/
	    },

	    comparator: function(action) {
			  return action.get("date");
			},


	    plantings: function(){
	    	return this.where({'actionType': 'planting'});
	    },

	    harvests: function(){
	    	return this.where({'actionType': 'harvest'});
	    },

	    obversations: function(){
	    	return this.where({'actionType': 'observation'});
	    },

	    create: function(){
	    	var args = Array.prototype.slice.call(arguments);
	    	args[0].subject_type = 'planting';
	    	args[0].subject_id = this.planting_id;
	    	return Backbone.Collection.prototype.create.apply(this, args);
	    }

		});
    return PlantingActions;
  });