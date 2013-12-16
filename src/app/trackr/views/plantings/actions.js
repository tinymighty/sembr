define( ['sembr', 'backbone', 'marionette', 'jquery', 
'trackr/views/plantings/action', 'trackr/views/plantings/add-action',
'hbs!./actions.tpl'],
function(sembr, Backbone, Marionette, $, 
PlantingActionView, AddAction,
template) {
  //ItemView provides some default rendering logic
  return Backbone.Marionette.CompositeView.extend( {
    template: template,
    itemView: PlantingActionView,
    itemViewContainer: '.items',
    attributes:{
        class: 'ui feed segment'
    },
    ui:{
        addActionForm: '.add.action.form'
    },
    // View Event Handlers
    events: {
        
    },

    initialize: function(options) {
        if(this.model && !this.collection){
            this.collection = this.model.actions();
        }
        this.views = {
            addAction: new AddAction({planting:this.model, collection:this.collection})
        }
    },

    onRender: function(){
        this.ui.addActionForm.append( this.views.addAction.render().$el );
    }

  });
});