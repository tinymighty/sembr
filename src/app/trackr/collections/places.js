define(['sembr', "jquery", "backbone", 'sembr.collection', "../models/place.js"],
  function(sembr, $, Backbone, Collection, Place) {

    var Places = Collection.extend({
		  model: Place,

		  /*pouch: {
	      fetch: 'query',
	      options: {
	        query: {
	          fun: {
	            map: function(doc) {
	            	if(doc.type==="place"){
	            		console.log("fetching places...");
	              	emit([doc.order, doc._id], null);
	            	}
	            }
	          }
	        }
	      }
	    },*/

	    initialize: function(options){

	    },

	    views: {
	    	fetch_where: {
	    		map: function(doc){
	    			if(doc.type==='place'){
	    				//emit multiple rows to allow for null values in fields
	    				emit([doc.user, doc.in_place, doc.date_created, doc.date_modified], null);
	    				emit([doc.user, null, doc.date_created, doc.date_modified], null);
	    				emit([null, null, doc.date_created, doc.date_modified], null);
	    			}
	    		},
  	    	keys: ['user', 'in_place', 'date_created', 'date_modified']
  	    }
	    },

	    /*parse: function(jsonModels){
	    	//create a map of _id:obj
	    	var map = _(jsonModels).chain().pluck('_id').object( jsonModels ).value();
	    	//iterate through the models and set up the correct place hierarchy
	    	_(jsonModels).each(function(place, i){
	    		if(place.in_place){
	    			if(map[place.in_place].has_places){
	    				map[place.in_place].has_places.push(place);
	    			}else{
	    				map[place.in_place].has_places = [place]
	    			}
	    		}
	    	});
	    	//get the updated objects
	    	jsonModels = _(map).values();
	    	//places should only be present at top-level objects if they do not have an in_place property
	    	jsonModels = _(jsonModels).filter(function(place){
	    		return !place.in_place;
	    	});

	    	return jsonModels;
	    }
*/

		});
    return Places;
  });