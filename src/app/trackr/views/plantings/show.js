define( ['sembr', 'backbone', 'marionette', 'jquery', 'trackr/views/plantings/actions', 'hbs!./show.tpl'],
function(sembr, Backbone, Marionette, $, PlantingActionsView, template) {
  //ItemView provides some default rendering logic
  return Backbone.Marionette.ItemView.extend( {
    tagName: 'div',
    template: template,

    initialize: function(opts){
        sembr.log('Planting show view for planting model: ', this.model);
        this.actionsView = new PlantingActionsView( {model:this.model} );
    },

    onRender: function(){
        this.$('[data-view="actions"]').append( this.actionsView.render().$el );
    },

    serializeData: function(){
        return this.model.toJSON({include_associations:true});
    }

  });
});