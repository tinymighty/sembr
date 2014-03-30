define(["sembr", "underscore", "sembr.collection"],
  function(sembr, _, Collection) {

    var PlantingActions = Collection.extend({
		  
		  model: function(attrs, options) {
		    if(!attrs){
		  		return sembr.trackr.models.PlantingAction;
		  	}
		  	return sembr.trackr.models.PlantingAction.create(attrs, options);
		  },

	    initialize: function(options){
	    	Collection.prototype.initialize.apply(this, arguments);
	    },

	    comparator: function(action) {
			  return action.get("date");
			}

		});
    return PlantingActions;
  });