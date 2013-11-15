/** 
 * SembrModel class
 *
 * Defines a model class which can autoload it's dependencies. 
 **/
define(["underscore", 'jquery', "backbone"],
function(_, $, Backbone ) {
  var Collection = Backbone.Collection.extend( 

  /* INSTANCE METHODS */
  {
    //pouch: new Pouch('sembr'),

    query:{},

    /**
     * fetchWhere: like where(), except always syncs for new results
     * 
     * Returns a jQuery promise object.
     */
    fetchWhere: function(options){
      if(!options){
        //immediately return a rejected promise
        return new $.Deferred().reject('No options supplied to fetchWhere').promise();
      }

      if(!this.views || !this.views.fetch_where || !this.views.fetch_where.map || !this.views.fetch_where.keys){
        //immediately return a rejected promise
        return new $.Deferred().reject('fetchWhere called without a defined fetch_where view object').promise();
      }

      this.query.map = this.views.fetch_where.map;
      this.query.keys = this.views.fetch_where.keys;

      var startkey = [], endkey = [];

      //build the start keys and end keys
      _(this.query.keys).each(function(v){
        var val = options[v];
        if( !_(val).isEmpty() ){
          if( !_(val).isArray() ){
            val = [val]
          }
          _(val).sort();
          startkey.push( _(val).first() );
          endkey.push( _(val).last() );
        }else{
          startkey.push(null);
          endkey.push(null)
        }
      });

      this.query.options = {
        startkey: startkey,
        endkey: endkey
      }

      console.log('Fetching from fetch_where view with key range ',this.query.options);

      //the query is set up, so resolve to 
      return Backbone.Collection.prototype.fetch.apply(this, arguments);

    },

  },

  /* STATIC METHODS */
  {

  });

  return Collection;

});