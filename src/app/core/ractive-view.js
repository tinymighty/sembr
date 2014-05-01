define(['marionette', 'ractive', 'ractive.backbone'], function(Marionette, Ractive){
  "use strict";
  var RactiveView = Marionette.View.extend({
  	constructor: function( options ){
  		options = options || {};

      var 
        template = options.template || this.template
      ;

    if ( template === undefined ){
      throw new Error('Cannot instantiate RactiveView without a template.');
    }
    this._ensureElement();
      if(!this.data){
        this.data = {};
      }

  		//bind class methods or functions as Ractive invocation expressions
  		if( this.helpers !== undefined ){
  			_( this.helpers ).each(function( helper, name ){
  				if( _(helper).isFunction() ){
  					this.data[name] = _(helper).bind(this);
  				}else if( _(this[helper]).isFunction() ){
  					this.data[name] = _(this[helper]).bind(this);
  				}
  			}, this);
  		}

      if( this.decorators !== undefined ){
        _( this.decorators ).each(function( method, name ){
          if( !_(method).isFunction() && _(this[method]).isFunction() ){
            this.decorators[name] = _(this[method]).bind(this);
          }
          this.decorators[name] = _(this.decorators[name]).bind(this);
        }, this);
      }
      this._ractiveOptions = {};
      this._beforeRactive( options );

  		this.ractive = new Ractive( _({
  			el: this.$el,
  			template: _( this.template ).clone(),
  			data: this.data,
  			adaptors: [ Ractive.adaptors.Backbone ],
        decorators: this.decorators
  		}).defaults( this._ractiveOptions  ));

      console.log('Ractive view initialized: %o', this.ractive);

      //bind class methods or functions as Ractive events,
      //but keep them bound to this view object
      //ractive can be accessed at this.ractive
      if( this.events !== undefined ){
        _( this.events ).each(function( method, name ){
          if( !_(method).isFunction() && _(this[method]).isFunction() ){
            this.events[name] = _(this[method]).bind(this);
          }
          this.events[name] = _(this.events[name]).bind(this);
        }, this);
        this.ractive.on( this.events );
      }

      if( this.observers !== undefined ){
        _( this.observers ).each(function( method, name ){
          if( !_(method).isFunction() && _(this[method]).isFunction() ){
            this.observers[name] = _(this[method]).bind(this);
          }
          this.observers[name] = _(this.observers[name]).bind(this);
        }, this);
        this.ractive.observe( this.observers );
      }


  		Marionette.View.prototype.constructor.apply(this, arguments);

  	},

    //Evets are bound as Ractive events, so this is a no-op
    _delegateDOMEvents: function(){},
    undelegateEvents: function(){},

    /* Define this method to do any data inits before Ractive is instantiated */
    _beforeRactive: function(){},

  	set: function( keypath, value ){
      this.ractive.set(keypath, value);
  	},

    get: function( keypath ){
      return this.ractive.get( keypath );
    },

  	close: function(){
  		//destroy ractive view first
  		this.ractive.teardown();
  		//then perform usual cleanup
  		Marionette.View.prototype.close.apply(this, arguments);
  	},

  	render: function(){
      this.bindUIElements();
      this.triggerMethod("before:render", this);
      this.triggerMethod("render", this);
      return this;
  	}


  });

  return RactiveView;
});
