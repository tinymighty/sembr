/*! backbone-pouch - v1.1.0 - 2013-07-16
* http://jo.github.io/backbone-pouch/
* Copyright (c) 2013 Johannes J. Schmidt; Licensed MIT */
(function(root) {
  'use strict';
  
    // Require Underscore, if we're on the server, and it's not already present.
/*      var _ = root._;
    if (!_ && (typeof require === 'function')) {
      _ = require('underscore');
    }*/
  var BackbonePouch;
  if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
    BackbonePouch = {};
    define(['backbone', 'jquery', "underscore"], function(Boostrap, jQuery, _){ return BackbonePouch; });
  } else {


    if (typeof exports === 'object') {
      BackbonePouch = exports;
    } else { 
      BackbonePouch = root.BackbonePouch = {};
    }
  }



  var methodMap = {
    'create': 'post',
    'update': 'put',
    'patch':  'put',
    'delete': 'remove'
  };

  BackbonePouch.defaults = {
    fetch: 'allDocs',
    listen: true,
    options: {
      post: {},
      put: {},
      get: {},
      remove: {},
      allDocs: {
        include_docs: true
      },
      query: {
        include_docs: true
      },
      spatial: {
        include_docs: true
      },
      changes: {
        continuous: true,
        include_docs: true
      }
    }
  };

  function applyDefaults(options, defaults) {
    options.options = options.options || {};
    defaults.options = defaults.options || {};

    // merge toplevel options
    if (typeof options.fetch === 'undefined') {
      options.fetch = defaults.fetch;
    }
    if (typeof options.listen === 'undefined') {
      options.listen = defaults.listen;
    }
    if (typeof options.db === 'undefined') {
      options.db = defaults.db;
    }

    // merge PouchDB options
    _.each(defaults.options, function(value, key) {
      options.options[key] = options.options[key] || {};
      _.extend(options.options[key], value);
    });
  }

  // backbone-pouch sync adapter
  BackbonePouch.sync = function(defaults) {
    defaults = defaults || {};
    applyDefaults(defaults, BackbonePouch.defaults);

    var adapter = function(method, model, options) {
      var deferred = new jQuery.Deferred();
      var self = this;

      options = options || {};
      applyDefaults(options, model && model.pouch || {});
      applyDefaults(options, defaults);

      // This is to get the options (especially options.db)
      // by calling model.sync() without arguments.
      if (typeof method !== 'string') {
        return options;
      }

      // ensure we have a pouch db adapter
      if (!options.db) {
        throw new Error('A "db" property must be specified');
      }

      function callback(err, response) {
        if (err) {
          return options.error && options.error(err);
        }
        if (method === 'create' || method === 'update' || method === 'patch') {
          response = {
            _id: response.id,
            _rev: response.rev
          };
        }
        if (method === 'delete') {
          response = {};
        }
        if (method === 'read') {
          if (response.rows) {
            response = _.map(response.rows, function(row) {
              // use `doc` value if present
              return row.doc ||
                // or use `value` property otherwise
                // and inject id
                _.extend({
                  _id: row.id
                }, row.value);
            });
          }
          if (options.listen) {
            // TODO:
            // * implement for model
            // * allow overwriding of since.
            options.db.info(function(err, info) {
              // get changes since info.update_seq
              options.db.changes(_.extend({}, options.options.changes, {
                since: info.update_seq,
                onChange: function(change) {
                  var changeModel;
                  if(model instanceof Backbone.Collection){
                    var changeModel = model.get(change.id);
                    
                  }
                  if(model instanceof Backbone.Model){
                    if(change.id === model.get('_id')){
                      changeModel = model;
                    }
                  }

                  //if the model has been deleted, destroy it
                  if (change.deleted && changeModel) {
                    changeModel.destroy();
                  } else {
                    //if we have a model corresponding to this id, update it with the new document
                    if (changeModel) {
                      changeModel.set(change.doc);
                    }
                  }

                  // call original onChange if present
                  if (typeof options.options.changes.onChange === 'function') {
                    options.options.changes.onChange(change);
                  }
                }
              }));
            });
          }
        }
        //we now have to bind to the sync event to resolve  
        //if we resolve here then it's too soon, and anything waiting for the promise
        //will be executed before the rows have been applied to the collection
        model.once('sync', function(){ deferred.resolve(model, response); });

        return options.success && options.success(response);
      }

      model.trigger('request', model, options.db, options);
      if (method === 'read') {
        // get single model
        if (model.id) {
          options.db.get(model.id, options.options.get, callback);
          return deferred.promise()
        }
        // query view or spatial index
        if (options.fetch === 'query' || options.fetch === 'spatial') {
          if (!options.options[options.fetch].fun) {
            throw new Error('A "' + options.fetch + '.fun" object must be specified');
          }
          options.db[options.fetch](options.options[options.fetch].fun, options.options[options.fetch], callback);
          return deferred.promise();
        }
        // allDocs or spatial query
        options.db[options.fetch](options.options[options.fetch], callback);
      } else {
        options.db[methodMap[method]](model.toJSON(), options.options[methodMap[method]], callback);
      }
      return deferred.promise();
    };

    adapter.defaults = defaults;

    return adapter;
  };

  BackbonePouch.attachments = function(defaults) {
    defaults = defaults || {};

    function attachmentId(id, name) {
      return encodeURIComponent(id) + '/' + encodeURIComponent(name);
    }

    function getPouch(model) {
      if (model.pouch && model.pouch.db) {
        return model.pouch.db;
      }
      if (model.collection && model.collection.pouch && model.collection.pouch.db) {
        return model.collection.pouch.db;
      }
      
      if (defaults.db) {
        return defaults.db;
      }
      
      var options = model.sync();
      if (options.db) {
        return options.db;
      }

      // TODO: ask sync adapter
        
      throw new Error('A "db" property must be specified');
    }

    return {
      attachments: function(filter) {
        var atts = this.get('_attachments') || {};
        if (filter) {
          return _.filter(_.keys(atts), function(key) {
            if (typeof filter === 'function') {
              return filter(key, atts[key]);
            }
            
            return atts[key].content_type.match(filter);
          });
        }
        return _.keys(atts);
      },
      attachment: function(name, done) {
        var deferred = new jQuery.Deferred();
        // TODO: first look at the _attachments stub,
        // maybe there the data is already there
        var db = getPouch(this);
        return db.getAttachment(attachmentId(this.id, name), function(err, res){
          if(!err){
            deferred.resolve(res)
          }else{
            deferred.reject(err);
          }
          done(err, res);
        });

        return deferred.promise();
      },
      attach: function(blob, name, type, done) {
        var deferred = new jQuery.Deferred();
        if (typeof name === 'function') {
          done = name;
          name = undefined;
          type = undefined;
        }
        if (typeof type === 'function') {
          done = type;
          type = undefined;
        }
        name = name || blob.filename;
        type = type || blob.type;

        // If I do not already have an id, give me one
        if (!this.id) {
          this.set({ _id: Math.uuid() }, { silent: true });
        }
        
        var db = getPouch(this);
        var that = this;
        db.putAttachment(attachmentId(this.id, name), this.get('_rev'), blob, type, function(err, response) {
          if (!err && response.rev) {
            var atts = that.get('_attachments') || {};
            atts[name] = {
              content_type: type,
              stub: true
            };
            that.set({ _rev: response.rev, _attachments: atts }, { silent: true });
            deferred.resolve(atts)
          }else{
            deferred.reject(err);
          }

          done(err, response);
        });
        return deferred.promise();
      }
    };
  };
}(this));
