define( ['sembr', 'backbone', 'marionette', 'jquery', 'hbs!./action.tpl'],
function(sembr, Backbone, Marionette, $, template) {
  //ItemView provides some default rendering logic
  return Backbone.Marionette.ItemView.extend( {
    /*tagName: 'div',
    className: 'planting-action',*/
    template: template,

    attributes:{
        class: 'planting event'
    },

    // View Event Handlers
    events: {
        'click [data-action="destroy"]': 'confirmDestroy',
        'click [data-action="confirm-destroy"]': 'destroy',
        'click [data-action="cancel-destroy"]': 'cancelDestroy'
    },

    ui:{
        'deleteShape': '.delete.shape',
        'destroy': '[data-action="destroy"]'
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
        this.modelBinder = new Backbone.ModelBinder();
    },

    onRender: function(){
        this.bindModel();
        this.ui.deleteShape
          .shape()
        ;
    },

    confirmDestroy: function(){
        this.ui.deleteShape
          .shape('flip up')
        ;
    },

    destroy: function(){
        this.$el.transition('vertical flip', 700, _(function(){
            this.model.destroy();
        }).bind(this));
    },

    cancelDestroy: function(){
        this.ui.deleteShape
          .shape('flip')
        ;
    },

    bindModel: function () {
        var bindings = Backbone.ModelBinder.createDefaultBindings(this.el, 'data-model');
        this.modelBinder.bind(this.model, this.$el, bindings);
    }

  });
});