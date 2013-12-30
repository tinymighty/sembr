(function (root, factory) {

  'use strict';

  if (typeof exports === 'object') {

    var backbone = require('backbone');
    var hoodie = require('hoodie');
    var jquery = require('jquery');
    var supermodel = require('supermodel');

    module.exports = factory(backbone, hoodie, jquery, supermodel);

  } else if (typeof define === 'function' && define.amd) {

    define(['backbone', 'hoodie', 'jquery', 'supermodel'], factory);

  } else {
    // Browser globals
    root.hoodie = factory(root.Backbone, root.Hoodie, root.jQuery, root.Supermodel);
  }

}(this, function (Backbone, Hoodie, jQuery, Supermodel) {

  'use strict';

  var 
    hoodie, 
    sync, 
    defaults, 
    connect, 
    log, 
    enable_logging,
    _idattr_
  ;
  _idattr_ = Backbone.Model.prototype.idAttribute || 'id';

  enable_logging = false;

  if (enable_logging) {
    if (Function.prototype.bind) {
      log = Function.prototype.bind.call(console.log, console);
    }
    else {
      log = function() { 
          Function.prototype.apply.call(console.log, console, arguments);
      };
    }
  }else{
    log = function(){};
  }

  defaults = {
    fetch_associations: true
  };

  connect = function (url) {
    hoodie = new Hoodie(url);
  };

  sync = function (method, modelOrCollection, options) {
    var 
      attributes, 
      id, 
      promise, 
      type,
      modelConstructor,
      deferred,
      where,
      map
    ;


    options = _( options || {} ).defaults( defaults );

    //the primary deferred object, this method returns the related promise and resolves it when everything is fetched
    deferred = new jQuery.Deferred();

    id = modelOrCollection.id;
    attributes = modelOrCollection.attributes;

    where = options.where || false;
    map = options.map || false;

    if( modelOrCollection.model ){
      //calling the model faxtory method, if defined, without arguments should return the constructor, not an instance!
      //modelConstructor = (modelOrCollection instanceof Backbone.Model) ? modelOrCollection.model : modelOrCollection.model();
      modelConstructor = modelOrCollection.model;
      if ( !(modelConstructor instanceof Backbone.Model) ) {
        modelConstructor = modelConstructor();
      }
        //throw new Error('The model() factory method of the Collection should return a model constructor when called without arguments. Received a model instance instead.');
    }else{
      if(modelOrCollection instanceof Backbone.Collection){
        return false; //can't sync a collection which doesn't have a default model
      }
      modelConstructor = modelOrCollection;
    }

    type = type || (type = modelConstructor.prototype.type);

    log('Sync %o(%o): modelConstructor(%o) options(%o)', type, method, modelConstructor.prototype, options);

    //construct map function for where queries
    if(!map && where){
      //this is a pretty expensive operation on a large number of documents.  Use sparingly and with caution!
      map = function (doc) {
        var prop, value;
        //iterate through all the properties in the where object
        for( prop in where ){
          value = where[prop];
          //if the document has the property
          if ( where.hasOwnProperty( prop ) && doc.hasOwnProperty( prop ) ){
            value = _( value ).isArray() ? value : [value];
            if ( _(value).contains(doc[prop]) ) {
              return true;
            }
          }
        }
      }
    }


    promise = (function () {
      switch (method) {
        case 'read':
          if (id) {
            return hoodie.store.find(type, id);
          }
          else
          if ( map ) {
            return hoodie.store.findAll(map);
          }
          else {
            return hoodie.store.findAll(type);
          }
          break;
        case 'create':
          return hoodie.store.add(type, attributes);
        case 'update':
          return hoodie.store.update(type, id, attributes);
        case 'delete':
          return hoodie.store.remove(type, id);
      }
    })();

    //when the promise is fulfilled, call the Backbone success callback
    //which is responsible for instantiating/updating the relevant models
    //and firing the sync event
    //Note that at this point associations have NOT been loaded, and so
    //the primary promise will not yet be resolved...
    if (options.success) {
      promise.done(options.success);
    }

    if (options.error) {
      promise.fail(options.error);
    }

    promise
      .done( function( json ){
        log('Sync %o(%o): Initial sync complete; data(%o)', type, method, json);
        //fetch related documents to satisfy associations
        if( options.fetch_associations ){
          //see fetch_associations function below...
          fetch_associations( modelOrCollection, modelConstructor, options )
            .done( function( associations ){
              deferred.resolve( modelOrCollection, json );
            })
            .fail( function(){
              deferred.reject( 'Failed to fetch associations.' );
            })
          ;
        }else{
          deferred.resolve( modelOrCollection, json );
        }

      })
      .fail( function( json ){
        deferred.reject( 'Failed to retreive data from Hoodie.store' );
      })
    ;

    return deferred.promise();

  };




  function fetch_associations( modelOrCollection, modelConstructor, options ){
    var 
      deferred = new jQuery.Deferred(),
      rels = modelConstructor._hoodie_relations,
      models,
      attrs,
      ids,
      state = options.state || null,
      promises = []
    ;

    log('Sync %o: checking associations(%o)', modelConstructor.prototype.type, rels);

    if( rels && rels.length ){
      //retrieve related associations using their model/collections
      //in turn, that will call sync...
      //that model will then attempt to load the reverse of the same relation and we get an infinite loop...
      models = modelOrCollection.models || [modelOrCollection];
      attrs = _(models).pluck('attributes');
      ids = _(models).pluck(_idattr_);

      if(!state){
        state = {};
        state[modelConstructor.prototype.type] = attrs; //we don't need whole models in the state object, just attributes
      }



      for ( var i=0, l=rels.length; i<l; i++ ){
        var 
          rel = rels[i],
          rel_models = [],
          rel_ids,
          where = {},
          relModelConstructor,
          type,
          relPromise
        ;

        if(!rel.collection){
          log('Sync %o: Cannot load relation(%o) without a specified Collection', '?', rel);
          continue;
        }

        relModelConstructor = rel.model || rel.collection.prototype.model;

        if ( !(relModelConstructor.prototype instanceof Backbone.Model) && _(relModelConstructor).isFunction() ) {
          relModelConstructor = relModelConstructor();
        }
        type = relModelConstructor.prototype.type;
        log('Sync %o: Processing assocation %o(%o) with state(%o)', modelConstructor.prototype.type, type, rel, _(state).clone() );
       
        
        switch (rel.type) {
          case 'one':
            rel_ids = _( attrs ).chain().pluck(rel.id).unique().compact().value();
            log('one: rel_ids', rel_ids, rel.id);
            log('removing duplicate ids %o',_( state[type] ).pluck( _idattr_ ));
            if ( state[ type ] ) {
              rel_ids = _(rel_ids).difference( _( state[type] ).pluck( _idattr_ ) );
            }
            where[_idattr_] = rel_ids;
            
          break;
          case 'many': //has many via foreign object references
            rel_ids = _( models ).pluck( _idattr_ ); //fetch all that reference these objects
            log('many: rel_ids',rel_ids);
            log('removing duplicate ids %o',_( state[type] ).pluck( _idattr_ ));
            if ( state[ type ] ) {
              rel_ids = _(rel_ids).difference( _( state[type] ).pluck( _idattr_ ) );
            }
            where[ rel.id ] = rel_ids; 
          break;
          case 'many.list': //has many via an array of object ids in this object
            rel_ids = _( models ).chain().pluck( 'attributes' ).pluck( rel.source ).flatten().unique().value(); //fetch all ids referenced by the primary models
            log('many.list: rel_ids',rel_ids);
            log('removing duplicate ids %o',_( state[type] ).pluck( _idattr_ ));
            if ( state[ type ] ) {
              rel_ids = _(rel_ids).difference( _( state[type] ).pluck( _idattr_ ) );
            }
            where[ _idattr_ ] = rel_ids;
          break;
        }
        
        log('many: rel_ids after difference',rel_ids);

        if ( rel_ids.length ) {
          log('Sync %o: Fetching association %o(%o) where(%o)', modelConstructor.prototype.type, type, rel, where);
          //here we use the success function rather than the promise object, since it fires before further 
          //associations are loaded. This ensures that the state object is updated before the next hierarchy 
          //of associations runs
          var collection_inst = new rel.collection;
          relPromise = collection_inst.fetch( {state: state, where: where, success: function(model){
              if( !state[ type ]){
                state[ type ] = [];
              }
              state[ type ] = state[ type ].concat( _(collection_inst.models).pluck('attributes') );

              log('SYNC SUCCESS %o, ADDED MODELS %o TO STATE %o ', type, collection_inst.models, _(state).clone());

            }
          });
          promises.push(relPromise);
        }

      }

    }

    log('Waiting for promises to resolve', promises);
    if (promises.length) {
      jQuery.when.apply(jQuery, promises)
        .done(function(){
          log("All promises resolved, hurrah!");
          deferred.resolve( _(arguments).toArray() );
        })
        .fail(function(){
          deferred.reject('One of the association promises was rejected.');
        });
      ;
    } else {
      deferred.resolve();
    }

    return deferred.promise();
  }



  /*
   * Overload Supermodel.Model.has to build association info
   */
  var oldHas = Supermodel.Model.prototype.has;

  Supermodel.Model.prototype.has = function(){
    var has = oldHas.apply(this, arguments);
    var model = this;
    if ( !this._hoodie_relations ) {
      this._hoodie_relations = [];
    }
    return {

      one: function(name, options){ 
        options.chain = false;
        if (options.collection && !options.model) {
          options.model = options.collection.model;
          if ( !(options.model instanceof Backbone.Model) && _(options.model).isFunction() ){
            options.model = options.model();
          }
        }
        var assoc = has.one(name, options);

        model._hoodie_relations.push({
          association: assoc,
          type: 'one',
          model: options.model,
          collection: options.collection,
          id: options.id || name+'_id'
        });
        return this;
      },

      many: function(name, options){
        options.chain = false;

        //don't pass options.source along to supermodel... it has a different meaning here...
        var source = options.source;
        delete options.source;

        var assoc = has.many(name, options, false);

        var fetcher = {
          association: assoc,
          collection: options.collection
        };

        if( source ){
          //assume source refers to an array of ids...
          fetcher.type = 'many.list';
          fetcher.source = source;
          fetcher.id = options.id || _idattr_;
        }
        else{
          //
          fetcher.type = 'many';
          fetcher.id = options.id || options.inverse+'_id';
        }

        model._hoodie_relations.push( fetcher );
        return this;
      }

    };
  }

  Backbone.Model.prototype.merge = function (attributes) {
    this.set(attributes, {
      remote: true
    });
  };

  Backbone.Collection.prototype.initialize = function () {
    var 
      type,
      self = this,
      model = this.model
    ;

    if (model) {
      //if model is a factory rather than a constructor, call it without arguments
      //it *should* then return the model constructor
      if( model === Backbone.Model && !Backbone.Model.prototype.type ){
        return;
      }
      if( !(model.prototype instanceof Backbone.Model) && _(model).isFunction() ){
        model = model();
      }
      if( !(model.prototype instanceof Backbone.Model) ){
        throw new Error('Expected collection.model to be a model constructor or factory method which returns a constructor.');
      }
      type = model.prototype.type;

      if (type) {

        hoodie.store.on('add:' + type, function (attributes) {
          self.eventAdd(attributes);
        });

        hoodie.remote.on('add:' + type, function (attributes) {
          self.eventAdd(attributes);
        });

        hoodie.store.on('remove:' + type, function (attributes) {
          self.eventRemove(attributes);
        });

        hoodie.remote.on('remove:' + type, function (attributes) {
          self.eventRemove(attributes);
        });

        hoodie.store.on('update:' + type, function (attributes) {
          self.eventUpdate(attributes);
        });

        hoodie.remote.on('update:' + type, function (attributes) {
          self.eventUpdate(attributes);
        });

      }

    }

  };

  Backbone.Collection.prototype.eventAdd = function (attributes) {
    this.add(attributes);
  };

  Backbone.Collection.prototype.eventRemove = function (attributes) {
    var id, _ref;
    id = attributes.id;

    return (_ref = this.get(id)) !== null ? _ref.destroy() : void 0;
  };

  Backbone.Collection.prototype.eventUpdate = function (attributes) {
    var id, _ref;
    id = attributes.id;
    return (_ref = this.get(id)) !== null ? _ref.merge(attributes) : void 0;
  };

  return {
    sync: sync,
    attach: function( ){
      Backbone.sync = sync;
      Backbone.hoodie = hoodie;
      return this;
    },
    hoodie: hoodie,
    connect: function( ){
      connect();
      this.hoodie = hoodie;
      return this;
    },
    log: function( bool ){
      enable_logging = !!bool;
      return this;
    }
  };

}));

