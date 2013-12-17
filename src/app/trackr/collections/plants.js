define(["sembr", "underscore", "sembr.collection"],
  function(sembr, _, Collection) {

    var Plants = Collection.extend({

		  model: function(attrs, options) {
		  	if(!attrs){
		  		return sembr.trackr.models.Plant;
		  	}
		    return sembr.trackr.models.Plant.create(attrs, options);
		  }

		});
    return Plants;
  });