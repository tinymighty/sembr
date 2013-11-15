/** 
 * SembrModel class
 *
 * Defines a model class which can autoload it's dependencies. 
 **/
define(["underscore", "backbone", 'pouchdb',
'backbone.relational'],
function(_, Backbone, Pouch ) {
  var SembrModel = Backbone.RelationalModel.extend( 

  /* INSTANCE METHODS */
  {

  },

  /* STATIC METHODS */
  {

  	findOrFetch: function(attributes){
    	var model, deferred;
    	deferred = new $.Deferred();
    	model = this.find(attributes);
    	if(model){
    		deferred.resolve(model);
    	}else{
        console.log('findOrFetch: Instantiating new model %o with attrs %o', this, attributes);
	    	new this(attributes)
	    		.fetch()
	    		.done(function(new_model, data){
	    			deferred.resolve(new_model, data);
	    		})
	    		.fail(function(){
	    			console.error("Failed to fetch model");
	    		});
    	}
    	return deferred.promise();
    },

  });

  return SembrModel;

});