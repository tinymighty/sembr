define( ['sembr', 'backbone', 'marionette', 'jquery', 'hbs!./planting.tpl'],
function(sembr, Backbone, Marionette, $, template) {
  //ItemView provides some default rendering logic
  return Backbone.Marionette.ItemView.extend( {
    attributes:{
        class: 'planting'
    },
    template: template,

    // View Event Handlers
    events: {
        'click a': 'click'
    },

    initialize: function(options){
        this.options = options;
    },


    click: function($ev){
        sembr.log('Plant click!')
        $ev.preventDefault();
        //sembr.navigate( $($ev.target).attr('href'), {trigger: true});
    },

    serializeData: function(){
        var data = this.model.toJSON({include_associations:true});
    }

  });
});