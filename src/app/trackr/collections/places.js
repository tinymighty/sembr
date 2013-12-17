define(["sembr", "underscore", "sembr.collection"],
  function(sembr, _, Collection) {

    var Places = Collection.extend({

		  model: function(attrs, options) {
		    if(!attrs){
		  		return sembr.trackr.models.Place;
		  	}
		    return sembr.trackr.models.Place.create(attrs, options);
		  }
		  
		});
    return Places;
  });