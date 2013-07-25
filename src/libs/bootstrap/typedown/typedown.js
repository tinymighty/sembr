define(['jquery', 'core.view', 'underscore', 'bootstrap', '/app/components/typedown/jquery.typedown.js'], function($, View, _, Bootstrap) {

  var TypeDown = View.extend({

    events: {

    },
    
    instances: [],
        
    initialize: function() {
      
      //source should either be an array of values, an url, or a function (as per bootstrap typeahead, see docs)
      this.source = this.options.source || undefined; 
     
      if(_(this.source).isString()){
        this.sourceUrl = this.source;
        this.source = this.fetchSource;
      }
      
      var opts = {
        minLength: 0,
        source: this.source,
        items: 1000
      };
           
      console.log("init typedow with opts", opts); 
      this.$el.typedown(opts);
    },
    
    fetchSource: function(query, callback) {
      $.ajax({
        url: this.sourceUrl,
        data: {query: query},
        async: false,
        dataType: 'json',
        success: function(data) {
          console.log('got data', data);
          callback(data);
        }
      });
    },
    
    /*
    setData: function(data){
      this.typeahead.process(data);
    },
    
    getSource: function(){
      var promise;
      if(_(this.source).isFunction()){
        promise = this.source( _.bind(function(data){ this.setData(data); }, this) );
      }
      if(_(this.source).isString()){
        promise = this.fetchSource(this.source);
      }
      if(promise!==undefined){
        promise.done(_.bind(function(data){
          this.setData(data);
        }, this));
      }else{
        throw 'Invalid source';
      }
    }*/
    
    
    render: function() {

    }

  });
  
  $('[data-provide=typedown]').each(function(i,el){
    new TypeDown({el:el, source:$(el).attr('data-source')});
  });
  
  
  return TypeDown;
});