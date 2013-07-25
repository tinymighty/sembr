define(["jquery","backbone","../models/place.js"],
  function($, Backbone, Place) {
    var Collection = Backbone.Collection.extend({
		  model: Place,
		  pouch: {
	      fetch: 'query',
	      options: {
	        query: {
	          fun: {
	            map: function(doc) {
	            	if(doc.type==="place"){
	              	emit([doc.order, doc._id], null);
	            	}
	            }
	          }
	        }
	      }
	    }

		});
    return Collection;
  });