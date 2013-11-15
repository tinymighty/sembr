define(["jquery", "backbone", "underscore", "sembr.collection", "../models/plant.js"],
  function($, Backbone, _, Collection, Plant) {
    var Collection = Collection.extend({
		  model: Plant,

	    initialize: function(options){
	    	//if a place_id is passed in options, only fetch rows which match that place_id
	    	this.options = {};

	    	if(options && options.where){
	    		this.query.map = this.views.fetch_where.map;
	    		this.query.keys = this.views.fetch_where.keys;
	    		this.options = options;
	    	}

	    },

	    views: {
	    	fetch_where: {
	    		map: function(doc){
	    			if(doc.type==='plant'){
	    				emit([doc.use_name], null);
	    			}
	    		},
  	    	keys: ['use_name']
  	    }
	    }

		});
    return Collection;
  });