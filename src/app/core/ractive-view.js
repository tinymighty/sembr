define(['marionette', 'ractive', 'ractive.backbone'], function(Marionette, Ractive){

  var RactiveView = Marionette.View.extend({
  	constructor: function( options ){
  		options = options || {};

  		var template = options.template || this.template;

  		if ( template === undefined ){
  			throw new Error('Cannot instantiate RactiveView without a template.');
  		}
  		this._ensureElement();
  		this.data = {};

  		//bind class methods or functions as Ractive invocation expressions
  		if( this.helpers !== undefined ){
  			_( this.helpers ).each(function( helper, name ){
  				if( _(helper).isFunction() ){
  					this.data[name] = helper;
  				}else if( _(this[helper]).isFunction() ){
  					this.data[name] = this[helper];
  				}
  			}, this);
  		}

  		this.ractive = new Ractive({
	  			el: this.$el,
	  			template: this.template,
	  			data: this.data,
	  			adaptors: [ Ractive.adaptors.Backbone ],
	  		});

  		Marionette.View.prototype.constructor.apply(this, arguments);

  	},

  	set: function( property, value ){
  		this.data[property] = value;
  	},

  	close: function(){
  		//destroy ractive view first
  		this.ractive.teardown();
  		//then perform usual cleanup
  		Marionette.View.prototype.close.apply(this, arguments);
  	},

  	render: function(){
  		if(this.ractive){
  			this.ractive.update(); //this should be totally unnecessary
  		}else{
  			
  		}
  		return this;
  	}



  });

  return RactiveView;
});
