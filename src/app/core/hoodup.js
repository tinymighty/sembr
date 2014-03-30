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
    printLog,
    enable_logging,
    _idattr_
  ;
  _idattr_ = Backbone.Model.prototype.idAttribute || 'id';

  enable_logging = true;

  if (enable_logging) {
    /*if (Function.prototype.bind) {
      log = Function.prototype.bind.call(console.log( console);
    }
    else {
      log = function() { 
          Function.prototype.apply.call(console.log( console, arguments);
      };
    }*/
    /*var logfile = {};
    log = function(type){
      var args = _(arguments).toArray().slice(1);
      if(!logfile[type]){
        logfile[type] = [];
      }
      args.unshift('log');
      logfile[type].push(args);
    }
    warn = function(type){
      var args = _(arguments).toArray().slice(1);
      if(!logfile[type]){
        logfile[type] = [];
      }
      args.unshift('warn');
      logfile[type].push(args);
    }*/
    log = Function.prototype.bind
      ? Function.prototype.bind.call(console.log, console )
      : function() { Function.prototype.apply.call(console.log, console, arguments); };
    /*var printLog = function(type){
      var level, method;
      console.group(type);
      _(logfile[type]).each(function(args){
        level = args.shift();
        method = (level==='warn') ? 'warn' : 'log';
        console[method].apply(console, args);
      });
      console.groupEnd();  
    }*/
  }else{
    log = printLog = function(){};
  }




  defaults = {
    fetch_associations: true,
    always_fetch_associations: false, //force a fetch even if an instance of the association already exists
    max_depth: -1, //how deep to fetch associations. -1 for no limit. 0 will load the associations for the initial fetch only

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
    attributes = modelOrCollection.toJSON();

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
      modelConstructor = modelOrCollection.constructor;
    }

    type = type || modelConstructor.prototype.type;
    log( 'Sync %o(%o): modelConstructor(%o) options(%o)', type, method, modelConstructor.prototype, options);

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
      console.warn("Hitting localStorage! This is a superduper slow operation.");

      switch (method) {
        case 'read':
          if (id) {
            log('Querying Hoodie by type (%s) and id (%s)', type, id);
            return hoodie.store.find(type, id);
          }
          else
          if ( map ) {
            log('Querying Hoodie with map: %o', map);
            return hoodie.store.findAll(map);
          }
          else {
            log('Querying Hoodie for all of type (%s)', type);
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

    promise.done(function( json ){
      log( 'Sync %o(%o): Initial sync complete; data(%o)', type, method, json);
    });

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
        //fetch related documents to satisfy associations
        if( options.fetch_associations && method==='read' ){
          //see fetch_associations function below...
          get_associations( modelOrCollection, modelConstructor, options )
            .done( function(  ){
              deferred.resolve( modelOrCollection, json );
            })
            .fail( function(  ){
              deferred.reject( 'Failed to fetch associations.' );
            })
            .then( function(){

            } );
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



  /**
   * [fetch_associations description]
   * @param  {[type]} modelOrCollection
   * @param  {[type]} modelConstructor
   * @param  {[type]} options
   * @return {[type]}
   */
  function get_associations( modelOrCollection, modelConstructor, options ){
    var 
      deferred = new jQuery.Deferred(),
      type = modelConstructor.prototype.type,
      rels = modelConstructor._hoodie_relations,
      models,
      //an array of attribute objects pulled from the models
      attrs,
      ids,
      //a state object of the currently loaded models, to prevent duplication as we traverse
      //the dependency tree
      state = options.state || null, 
      has_all_associations = false,
      //an array of association fetch promises, one for each association type
      promises = []
    ;

    log( 'Sync %o: checking associations(%o)', type, rels);

    if( rels && rels.length ){
      //retrieve related associations using their model/collections
      //in turn, that will call sync...
      //that model will then attempt to load the reverse of the same relation and we get an infinite loop...
      models = modelOrCollection.models || [modelOrCollection];
      attrs = _(models).pluck('attributes'); //an array attribute objects of all fetched models
      ids = _(models).pluck(_idattr_);

      if(!state){
        state = {
          __depth:0,
        };
        state[modelConstructor.prototype.type] = attrs; //we don't need whole models in the state object, just attributes
      }else{
        state.__depth++;
      }
      //if we're already at the match association fetch depth, fake out
      if( options.max_depth > -1 &&  state.__depth > options.max_depth ){
        deferred.resolve();
        return deferred.promise();
      }else{
        //check here to see if any associations have been excluded
        //if we're loading all associations for this model group, 
        //we need to mark is as complete so we know not to bother
        //reloading it in the future
        has_all_associations = true;
      }


      //iterate through all relationships for this model constructor
      for ( var i=0, l=rels.length; i<l; i++ ){
        var 
          rel = rels[i],
          rel_models = [],
          rel_ids = [],
          where = {},
          whereIdProperty,
          relModelConstructor,
          type,
          relPromise
        ;

        if(!rel.collection){
          console.warn('Sync %o: Cannot load relation(%o) without a specified Collection', '?', rel);
          continue;
        }

        relModelConstructor = new rel.collection().getModelConstructor();
        type = relModelConstructor.prototype.type;
        if(! type ){
          throw 'Cannot sync an association which does not specify a type property.';
        }
        log( 'Sync %o: Processing assocation %o(%o) with state(%o)', modelConstructor.prototype.type, type, rel, _(state).clone() );
       
        var found;
        switch ( rel.type ) {
          //has one
          case 'one':
            //create a flat unique array of all ids of the referenced model
            rel_ids = _( attrs ).chain().pluck(rel.id).unique().compact().value();
            log( 'one: rel_ids', rel_ids, rel.id);
            whereIdProperty = _idattr_;
          break;

          //has many via foreign object references
          case 'many': 
            //grab the ids of all these objects
            rel_ids = _( models ).pluck( _idattr_ );
            log( 'many: rel_ids',rel_ids);
            //set the where property to the property on the other object which references this object
            whereIdProperty = rel.id;  
          break;

          //has many via an array of object ids in this object
          case 'list': 
            //create a flat unique array of all ids referenced in all model lists
            rel_ids = _( models ).chain().pluck( 'attributes' ).pluck( rel.source ).flatten().unique().value(); //fetch all ids referenced by the primary models
            log( 'many.list: rel_ids',rel_ids);
            whereIdProperty = _idattr_;
          break;
        }
log();
        log( 'Rel(%s) rel_ids before duplicate and existing instance checks', type, rel_ids);

        //remove items from the fetch list which are already present in the state object
        //i.e. they have already been loaded in a previous get_associations iteration
        if ( state[ type ] ) {
          
          //iterate through the current association type and look
          //for ids for objects which are already present in the state object
          var state_ids = _( state[ type ] )
            .chain()
            .filter( function( o ){
              if( rel_ids.indexOf(o[whereIdProperty]) > 0 ){
                return true;
              }
            })
            .pluck(_idattr_)
            .value();
          //log('Checking for duplicate association ids %o : %o', rel_ids, existing_ids );

          rel_ids = _(rel_ids).difference( state_ids );
        }

        //log( 'Existing IDs...', _(relModelConstructor.all().models).chain().pluck('attributes').pluck('id').value() );

        //now look for objects which have already been fully instantiated 
        //if( !options.always_fetch_associations ){
          rel_ids = _(rel_ids).difference(
            _(relModelConstructor.all().models).chain().pluck('attributes').pluck('id').value()
          );
        //}
        
        where[ whereIdProperty ] = rel_ids;

        
        log( 'rel_ids after duplicate and existing instance checks', rel_ids);

        if ( rel_ids.length ) {
          log( 'Sync %o: Fetching association %o(%o) where(%o)', modelConstructor.prototype.type, type, rel, where);
          //here we use the success function rather than the promise object, since it fires before further 
          //associations are loaded. This ensures that the state object is updated before the next hierarchy 
          //of associations runs
          var collection_inst = new rel.collection;
          relPromise = collection_inst.findOrFetch( {
            state: state, 
            where: where, 
            success: function( model ){
              if( !state[ type ]){
                state[ type ] = [];
              }
              state[ type ] = state[ type ].concat( _(collection_inst.models).pluck('attributes') );

              log( 'SYNC SUCCESS %o, ADDED MODELS %o TO STATE %o ', type, collection_inst.models, _(state).clone());
            }
          });
          promises.push(relPromise);
        }

      }

    }

    log( 'Waiting for promises to resolve', promises);
    if (promises.length) {
      jQuery.when.apply(jQuery, promises)
        .done(function(){
          log( "All promises resolved, hurrah!");
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
  var oldHas = Supermodel.Model.has;

  Supermodel.Model.has = function(){
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
          fetcher.type = 'list';
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
      //if it's just a reference to a standard Backbone model constructor
      //and it doesn't have a type, skip init
      if( model === Backbone.Model || !model.prototype.type ){
        return;
      }

      //log( 'Model is Backbone %o, instance of it %o, proto is instance %o:', model === Backbone.Model, model instanceof Backbone.Model, model.prototype instanceof Backbone.Model);
      //log( 'Model is SuperModel %o, instance of it %o, proto is instance %o:', model === Supermodel.Model, model instanceof Supermodel.Model, model.prototype instanceof Supermodel.Model);

      //if model is a factory rather than a constructor, call it without arguments
      //it *should* then return the model constructor

      //check to see if we've been passed a model factory method
      //if run without arguments, this should give us a model constructor

      //the model.isNew is a temporary hack to work around a prototype bug!
      if( !(model.prototype instanceof Backbone.Model) &&  _(model).isFunction() ){
        //if it's a function, which doesn't seem to inherit from Backbone.Model, and doesn't share it's signature
        //(for a bad prototype chain)
        if( !model.prototype.isNew ){
          model = model();
        }
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

  // Prepare a hash of attributes (or other model) to be added to this
  // collection.
  Backbone.Collection.prototype._prepareModel = function(attrs, options) {
    console.log('Preparing model with attrs %o', attrs);
    if (attrs instanceof Backbone.Model) return attrs;
    options = options ? _.clone(options) : {};
    options.collection = this;
    var model = this.model().create(attrs, options);
    if (!model.validationError) return model;
    this.trigger('invalid', this, model.validationError, options);
    return false;
  };


  Backbone.Collection.prototype.getModelConstructor = function(){
    //if it's a function and doesn't seem to be a model constructor, it should be a factory
    //function which returns a reference to the model constructor
    if ( !(this.model.prototype instanceof Backbone.Model) && _(this.model).isFunction() ) {
      return this.model();
    }else{
      return this.model;
    }
  }

  Backbone.Collection.prototype.findOrFetch = function(options){
    options = options || {};


    //grab a reference to the model constructor associated with this collection
    var 
      modelConstructor = this.getModelConstructor(),
      type,
      model
    ;

    if(!modelConstructor.prototype.type){
      console.error('findOrFetch can only be used on collections which define a model constructor with a type property.');
      return;
    }
    type = modelConstructor.prototype.type;

    //models which are already loaded
    var existingModels = [];
    log( 'Collection.findOrFetch(%o)', options);

    if(options.where && options.where.id){
      log( 'Checking for an existing model instances with ids: %o', options.where.id);
      //iterate through the fetch ids and check if an instance already exists
      _(options.where.id).each(function(id, i){
        if( model = modelConstructor.find({id: id}) ){
          log( 'Satisfied fetch with cached model for id: '+id);
          //the model already exists, so remove it from the where query
          options.where.id.splice(i, 1);
          this.add(model);
        }

      }, this);

    }
    var promise = this.fetch(options);
    /*promise.then(function(){

    });*/
    return promise;

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

