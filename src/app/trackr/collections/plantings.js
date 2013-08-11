define(["jquery","backbone", "underscore", "../models/planting.js", "backbone.pouch"],
  function($, Backbone, _, Planting, BackbonePouch) {
    var Collection = Backbone.Collection.extend({
		  model: Planting,
		  pouch: {
	      fetch: 'query',
	      options: {
	        query: {
	          fun: {
	            map: function(doc) {
	            	if(doc.type==="planting"){
	              	emit([doc.user, doc._id]);
	            	}
	            }
	          }
	        }
	      }
	    },

	    cached_ids: [],

	    /**
	     * Fetch nested models referenced by ID
	     */
	    fetchRelatedJSON: function(jsonModels){
	    	var deferred = new $.Deferred();

	    	//var opts = options = _({parse:true, fetchRelated: true}).extend(options);
	    	var db = Backbone.sync().db;

	      /*var actions_map = function(doc) {
        	if(doc.type==="action" && doc.subject_type==="planting"){
          	emit([doc.user, doc._id]);
        	}
        };
	    	db.query({map: plantings_map}, {include_docs:true}, function(err, response) { 
	    		if(err){
	    			deferred.reject(err);
	    		}

	    		var plantings = _(response.rows).pluck('doc');
	    		//get an array of all place ids
	    		var places_ids = _(plantings).chain().pluck('place_id').unique().value();

	    		
	    	});*/
				
				//build an array of unique place ids in models in this collection
				var places_ids = _(jsonModels).chain().pluck('place_id').unique().value();

				console.log('Plantings Collection: Fetching related JSON', this.models, places_ids);

	    	//get all place docs corresponding to the array of ids
    		db.allDocs({include_docs:true, keys:places_ids}, function(err, response){
    			if(err){
    				return deferred.reject(err);
    			}
    			//make an array of place docs
    			var places = _(response.rows).pluck('doc');

    			//create a hash with place ids as property names and place JSON objects as values
    			var places_map = _(places).chain().pluck('_id').object( places ).value();

    			//iterate through plantings and assign place
    			_(jsonModels).each(function(m){
    				m.place = places_map[m.place_id] || undefined;
    			});
    			console.log('Plantings Collection: Enhanced JSON models with related documents', jsonModels);
    			//resolve the promise with the plantings
    			//deferred.resolve(plantings);
    			deferred.resolve(jsonModels);
    		}.bind(this));


	    	return deferred.promise();
	    }

		});
    return Collection;
  });