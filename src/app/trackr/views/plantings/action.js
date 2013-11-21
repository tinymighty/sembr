define( ['sembr', 'backbone', 'marionette', 'jquery', 'hbs!./action.tpl'],
function(sembr, Backbone, Marionette, $, template) {
  //ItemView provides some default rendering logic
  return Backbone.Marionette.ItemView.extend( {
    /*tagName: 'div',
    className: 'planting-action',*/
    template: template,


    // View Event Handlers
    events: {
        'click [data-action="destroy"]': 'confirmDestroy',
        'click [data-action="destroy_confirm"]': 'destroy',
    },

    ui:{
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

    },

    confirmDestroy: function(){
        sembr.log('Destroy');
        this.ui.destroy.tooltip({title: 'Are you sure? Click again to confirm.', trigger:'manual'}).tooltip('show');
        this.ui.destroy.addClass('btn-warning')
            .attr('data-action', 'destroy_confirm')
            .mouseout(function(){ 
                $(this).attr('data-action','destroy').removeClass('btn-warning').tooltip('hide');
            });
    },

    destroy: function(){
        this.model.destroy();
    },

    bindModel: function () {
        var bindings = Backbone.ModelBinder.createDefaultBindings(this.el, 'data-model');
        this.modelBinder.bind(this.model, this.$el, bindings);
    }

  });
});