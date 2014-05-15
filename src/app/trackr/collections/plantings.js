define(["sembr", "underscore", "sembr.collection"],
  function(sembr, _, Collection) {

    var Plantings = Collection.extend({

		  model: function(attrs, options) {
		    if(!attrs){
		  		return sembr.trackr.models.Planting;
		  	}
		    return sembr.trackr.models.Planting.create(attrs, options);
		  },

		  comparator: function(chapter) {
			  return chapter.get("planted_from");
			}

		});

    return Plantings;
  });