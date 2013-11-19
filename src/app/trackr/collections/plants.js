define(["sembr", "underscore", "sembr.collection"],
  function(sembr, _, Collection) {
    var Plants = Collection.extend({
		  model: function(attrs, options) {
		    return sembr.trackr.models.Plant.create(attrs, options);
		  },


	    views: {
	    	fetch_all: {
	    		map: function(doc){
	    			if(doc.type==='plant'){
	    				emit(doc.use_name, null);
	    			}
	    		},
	    		keys: ['use_name']
	    	},
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
    return Plants;
  });