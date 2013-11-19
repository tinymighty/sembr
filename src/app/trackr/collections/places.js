define(["sembr", "underscore", "sembr.collection"],
  function(sembr, _, Collection) {

    var Places = Collection.extend({
		  model: function(attrs, options) {
		    return sembr.trackr.models.Place.create(attrs, options);
		  },

	    initialize: function(options){
	    	Collection.prototype.initialize.apply(this, arguments);
	    	if(this.owner){

	    	}
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

		});
    return Places;
  });