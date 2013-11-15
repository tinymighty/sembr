define(['jquery', 'underscore', 'backbone', 'marionette'], function($, _, Backbone, Marionette){
  // Promises
  // ---------

  // Modelled closely on Marionette.Callbacks to provide a
  // stack of promises which must be resolved/rejected before
  // before the whole is resolved
  var Promises = function(){
    this._deferred = new $.Deferred();
    this._callbacks = [];
    this._promises = [];
  };

  _.extend(Promises.prototype, {

    // Add a callback to be executed. Callbacks added here are
    // guaranteed to execute, even if they are added after the 
    // `run` method is called.
    add: function(callback, contextOverride){
      this._callbacks.push({cb: callback, ctx: contextOverride});

      this._deferred
        .done(function(context, options){
          if (contextOverride){ context = contextOverride; }
          //call the callback and add it's return value (should be a promise)
          //to the promises stack
          this._promises.push( callback.call(context, options) );
        }.bind(this));
    },

    // Run all registered callbacks with the context specified. 
    // Additional callbacks can be added after this has been run 
    // and they will still be executed.
    run: function(options, context){
      var deferred = new $.Deferred();
      this._deferred.resolve(context, options);

      //don't care whether the promises were resolved or rejected,
      //just resolve when they have all returned a value
      $.when.apply(this, this._promises).then(function(){
        deferred.resolve();
      });
      return deferred.promise();
    },

    // Resets the list of callbacks to be run, allowing the same list
    // to be run multiple times - whenever the `run` method is called.
    reset: function(){
      var that = this;
      var callbacks = this._callbacks;
      this._deferred = $.Deferred();
      this._callbacks = [];
      this._promises = [];
      _.each(callbacks, function(cb){
        that.add(cb.cb, cb.ctx);
      });
    }
  });

  return Promises;
});