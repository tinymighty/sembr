define( ['sembr', 'backbone', 'marionette', 'jquery', 'hbs!./list-item.tpl'],
function(Sembr, Backbone, Marionette, $, template) {
  //ItemView provides some default rendering logic
  return Backbone.Marionette.ItemView.extend( {
    template: template,

    // View Event Handlers
    events: {
        'click a': 'plantingClick'
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
        this.on('render', this.bind);
        var self = this;
    },

    bind: function () {
        var bindings = Backbone.ModelBinder.createDefaultBindings(this.el, 'data-model');
        //console.log(bindings);
        /*bindings.place = {
            selector: '[data-model=place]',
            converter: function(direction, value){ console.log(direction, value); return direction==='ModelToView' ? value.name : value; }
        }*/
        this.modelBinder.bind(this.model, this.el, bindings);
    },

    plantingClick: function($ev){
        console.log('Plant click!')
        $ev.preventDefault();
        Sembr.navigate( $($ev.target).attr('href'), {trigger: true});
    }

  });
});