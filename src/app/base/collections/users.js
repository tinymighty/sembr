define(["sembr", "underscore", "sembr.collection"],
  function(sembr, _, Collection) {

    var Users = Collection.extend({
    	
		  model: function(attrs, options) {
		  	if(!attrs){
		  		return sembr.base.models.User;
		  	}
		    return sembr.base.models.User.create(attrs, options);
		  },

	    views: {
	    	fetch_where: {
	    		map: function(doc){
	    			if(doc.type==='email'){
	    				emit([doc.email], null);
	    			}
	    		},
  	    	keys: ['email']
  	    }
	    }

		});
    return Users;

  });