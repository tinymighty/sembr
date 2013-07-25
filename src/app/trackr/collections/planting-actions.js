define(["jquery","backbone","../models/action.js"],
  function($, Backbone, Action) {
    var Collection = Backbone.Collection.extend({
		  
		  model: Action,

		  pouch: {
	      fetch: 'query',
	      options: {
	        query: {
	          fun: {
	            map: function(doc) {
	            	if(doc.type==="action" && doc.subject_type==="planting" && doc.subject_id===options.planting_id){
	              	emit([doc.planting_id, doc.order], doc._id);
	            	}
	            }
	          }
	        }
	      }
	    },

	    initialize: function(options){
	    	this.pouch.options.query.planting_id = options.planting_id;
	    	this.planting_id = options.planting_id;
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

	    create: function(data){
	    	var args = Array.prototype.slice.call(arguments);
	    	args[0].subject_type = 'planting';
	    	args[0].subject_id = this.planting_id;
	    	return Backbone.Collection.prototype.create.apply(this, args);
	    }

		});
    return Collection;
  });