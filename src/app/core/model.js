/**
 * SembrModel class
 *
 * Defines a model class which can autoload it's dependencies.
 **/
define(['sembr', "underscore", "backbone", 'pouchdb', 'supermodel', 'backbone-validation'],
function(sembr, _, Backbone, Pouch, Supermodel, BackboneValidation ) {
  "use strict";
  var parent = Supermodel.Model.prototype;
  var SembrModel = Supermodel.Model.extend(

  // INSTANCE METHODS
  {
    filters: {},

    initialize: function(){
      if(!this.type){
        throw new Error('Model constructor must specify a type');
      }
      sembr.log('Initializing %o model (%s/%s) ', this.type, this.id, this.cid, arguments);
      //array of active association names on this model instance
      this._associations = [];

      _( this.filters ).bindAll( this );

      this._processSerializers();

      //keep an array of active association names so we can know the getter names to use.
      //without this there is no way to access associations programatically

      this.on('associate', function(property, inverse_property, model, inverse_model){
        sembr.log('associate %s.%s (%s/%s : %o)  -> %s.%s (%s : %o)', 
          this.type, inverse_property, this.id, this.cid, model, inverse_model.type, property, inverse_model.cid, inverse_model);
        //add the association to this model instance
        _(inverse_model._associations).contains(property) || inverse_model._associations.push(property);
        //add the association to the associated model instance
        _(this._associations).contains(inverse_property) || this._associations.push(inverse_property)
      }.bind(this));
      this.on('disassociate', function(property, inverse_property, inverse_model){
        //model._associations = _(model._associations).without(inverse_property);
        inverse_model._associations = _(inverse_model._associations).without(property);
        this._assocations = _(this._assocations).without(inverse_property);
        sembr.log('disassociate %s.%s (%s/%s : %o) / %s.%s (%s : %o)', 
          this.type, inverse_property, this.id, this.cid, model, inverse_model.type, property, inverse_model.cid, inverse_model);      }.bind(this));
      this.on('all', function(){
        //sembr.log('Model event: ', arguments);
      });

      Supermodel.Model.prototype.initialize.apply(this, arguments);

    },

    save: function(){
      delete this.attributes.cid;
      return parent.save.apply(this, arguments);
    },

    set: function(key, val, options){
      var attr, attrs;
      if (key == null) return this;

      // Handle both `"key", value` and `{key: value}` -style arguments.
      if (typeof key === 'object') {
        attrs = key;
        options = val;
      } else {
        (attrs = {})[key] = val;
      }

      //if there is a _set_[attr name] filter defined then pass the 
      //attribute through it 
      options || (options = {});
      
      _(attrs).each( function( value, name ){
        attrs[name] = this.filters[name] ? this.filters[name](value) : value;
      }, this);

      parent.set.call(this, attrs, options);

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

    /**
     * Returns true if all possible associations have been loaded for this model.
     * This does not guarantee those assocations are valid. Eg. a belongs-to association
     * may reference a model which has not actually been instantiated, and exists only
     * as an empty model, waiting to be sync'd.
     * @return {Boolean}
     */
    hasAllAssociations: function(){
      return (this._assocations.length === this.constructor.associations.length);
    }
  },

  // STATIC METHODS
  {

  	findOrFetchById: function(id, options){
    	var model, deferred;
    	deferred = new $.Deferred();
    	model = this.find({id: id});
    	if(model){
        sembr.log('findOrFetch: Found model instance for id %o', id);
    		deferred.resolve(model);
    	}else{
        sembr.log('findOrFetch: Instantiating new model %o with _id %o', this, id);
	    	model = new this({id: id})
	      model.fetch( options )
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

  _.extend(SembrModel.prototype, Backbone.Validation.mixin);

  return SembrModel;
  

});
