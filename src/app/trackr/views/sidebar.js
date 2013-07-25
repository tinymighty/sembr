define( ['sembr', 'backbone', 'marionette', 'jquery', 
 './places/quick-add.js', 'hbs!./sidebar.tpl', 'bootstrap'],
function(Sembr, Backbone, Marionette, $, QuickAddPlaceView, template) {
  //ItemView provides some default rendering logic
  return Backbone.Marionette.ItemView.extend( {
    template: template,

    events: {
        'click [data-action=addPlanting]': 'addPlanting',
        'click [data-action=add-place]': 'addPlaceClick'
    },

    ui:{
        'addPlaceButton': '[data-action=add-place]' 
    },

    initialize: function(opts){
        this.addPlace = new QuickAddPlaceView();
    },

    addPlaceClick: function(){
        this.ui.addPlaceButton.popover('show');
    },

    onRender: function(){
        this.ui.addPlaceButton.popover({trigger:'manual', content:this.addPlace.render().$el, placement:'left', html:true });
        this.ui.addPlaceButton.on('cancel', _(function(){ this.ui.addPlaceButton.popover('hide') }).bind(this));
    }

  });
});