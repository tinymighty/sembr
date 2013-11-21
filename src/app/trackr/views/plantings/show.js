define( ['sembr', 'backbone', 'marionette', 'jquery', 'trackr/views/plantings/actions', 'hbs!./show.tpl'],
function(sembr, Backbone, Marionette, $, PlantingActionsView, template) {
  //ItemView provides some default rendering logic
  return Backbone.Marionette.ItemView.extend( {
    tagName: 'div',
    template: template,

    // View Event Handlers
    events: {
        'click [data-action="addAction"]': 'addAction'
    },

    /*bindings: {
        firstName: '[name=firstName]',
        lastName: '[name=lastName]',
        height: '[name=height]',
        driversLicense:'[name=driversLicense]',
        motorcycleLicense:'[name=motorcycleLicense]',
        editableContent:'[name=editableContent]',
        graduated:[{selector: '[name=graduated]'}, {selector: '[name=driversLicense],[name=motorcycleLicense]', elAttribute: 'enabled', converter: function(direction, value){return value === 'yes';}}],
        eyeColor: [{selector: '[name=eyeColor]'}, {selector: 'span.label', elAttribute: 'style', converter: function(direction, value){return 'color:' + value}}]
    };*/

    initialize: function(opts){
        sembr.log('Planting show view for planting model: ', this.model);
        this.actionsView = new PlantingActionsView( {collection: this.model.actions()} );
    },

    onRender: function(){
        this.actionsView.render();
        this.$('[data-view="actions"]').append( this.actionsView.$el );
        sembr.log('DATA FOR VIEW', this.serializeData());
    },

    showActions: function(actions){
        sembr.log('Got actions, show actions view', actions)
    },

    openPopover: function($ev){
        $ev.preventDefault();
        var $el = $($ev.currentTarget);
        sembr.log($el.attr('data-contentProvider'));
        var content = $('[data-popover="'+$el.attr('data-contentProvider')+'"]')();
        sembr.log(content);
        $el.popover({ content:'Whaaaaat', trigger:'manual'});
        $el.popover('show');
    },

    serializeData: function(){
        return this.model.toJSON({include_associations:true});
    }

  });
});