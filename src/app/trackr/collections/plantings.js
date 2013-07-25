define(["jquery","backbone","../models/planting.js"],
  function($, Backbone, Planting) {
    var Collection = Backbone.Collection.extend({
		  model: Planting,
		  pouch: {
	      fetch: 'query',
	      options: {
	        query: {
	          fun: {
	            map: function(doc) {
	            	if(doc.type==="planting"){
	              	emit(doc._id, null);
	            	}
	            }
	          }
	        }
	      }
	    }

		});
    return Collection;
  });