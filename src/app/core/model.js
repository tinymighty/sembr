/**
 * SembrModel class
 *
 * Defines a model class which can autoload it's dependencies.
 **/
define(['sembr', "underscore", "backbone", 'pouchdb', 'supermodel'],
function(sembr, _, Backbone, Pouch, Supermodel ) {
  "use strict";
  var SembrModel = Supermodel.Model.extend(

  // INSTANCE METHODS
  {

    initialize: function(){
      if(!this.type){
        throw new Error('Model constructor must specify a type');
      }
      sembr.log('Initializing model ', this.name, arguments);
      //array of active association names on this model instance
      this._associations = [];

      this._processSerializers();

      //keep an array of active association names so we can know the getter names to use.
      //without this there is no way to access associations programatically

      this.on('associate', function(property, inverse_property, model, inverse_model){
        sembr.log('Model %s (%s): received associate event %o with inverse_property %o; model %o; inverse_model:%o', this.name, this.cid, property, inverse_property, model, inverse_model);
        //add the association to this model instance
        _(inverse_model._associations).contains(property) || inverse_model._associations.push(property);
        //add the association to the associated model instance
        _(this._associations).contains(inverse_property) || this._associations.push(inverse_property)
      }.bind(this));
      this.on('disassociate', function(property, inverse_property, inverse_model){
        //model._associations = _(model._associations).without(inverse_property);
        inverse_model._associations = _(inverse_model._associations).without(property);
        this._assocations = _(this._assocations).without(inverse_property);
        sembr.log('Model %s (%s): received associate event %o with inverse_property %o; model %o; inverse_model:%o', this.name, this.cid, property, inverse_property, model, inverse_model);
      }.bind(this));
      this.on('all', function(){
        //sembr.log('Model event: ', arguments);
      });

      Supermodel.Model.prototype.initialize.apply(this, arguments);

    },

    //define getters and setters for attribute values...
    _defineAttribute: function(key) {
      var model = this;
      //silently fail if the object already has a property with this name
      //this could be because this method has already run for the property
      //or it has already been defined as an actual object property
      if(!this.hasOwnProperty(key)){
        Object.defineProperty(model, key, {
          get: function () {
            if(this['__'+key]){
              return this['__'+key]();
            }else{
              return model.get(key);
            }
          },
          set: function (value) {
            if(this['__'+key]){
              return this['__'+key]();
            }else{
              return model.set(key, value);
            }
          }
        });
      }
    },

    _processSerializers: function(){
      if(this.serialized){
        this.serialized = _(this.serialized).each(function(item, key, obj){
          if( _(item).isString() ){
            if( this.serializers[item] ){
              item = this.serializers[item];
            }else{
              throw 'Invalid serializer name';
            }
          }
          if(item.in){
            item.in = _(item.in).bind(this);
          }
          if(item.out){
            item.out = _(item.out).bind(this);
          }
          obj[key] = item;
        }, this);
      }
    },

    serializers: {
      date: {
        in: function(val){ return (val instanceof Date) ? Date.toString() : val; },
        out: function(val){ return new Date(val); }
      }
    },

    _serialize: function(){
      return this.attributes;
    },

    toJSON: function(options){
      var json;
      options = _(options || {}).defaults({
        include_associations: false
      });

      this._serialize();

      //defer to previous implementation for this objects attributes
      json = Supermodel.Model.prototype.toJSON.apply(this, arguments);
      if(options.include_associations){
        //only include associations to one level deep to prevent recursion
        options.include_associations = false;
        _(this._associations).each(function(name){
          json[name] = this[name]().toJSON(options);
        }, this);
      }
      return json;
    },


  },

  // STATIC METHODS
  {

  	findOrFetchById: function(id){
    	var model, deferred;
    	deferred = new $.Deferred();
    	model = this.find({id: id});
    	if(model){
        sembr.log('findOrFetch: Found model instance for id %o', id);
    		deferred.resolve(model);
    	}else{
        sembr.log('findOrFetch: Instantiating new model %o with _id %o', this, id);
	    	model = new this({id: id})
	      model.fetch()
	    		.done(function(new_model, data){
	    			deferred.resolve(new_model, data);
	    		})
	    		.fail(function(err){
            model = false;
	    			deferred.reject(err);
	    		});
    	}
    	return deferred.promise();
    }

  });

  return SembrModel;


});
