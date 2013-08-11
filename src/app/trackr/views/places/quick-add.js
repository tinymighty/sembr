define( ['sembr', 'backbone', 'marionette', 'jquery', 
'../../models/place.js', '../../collections/places.js', 'hbs!./quick-add.tpl', 
'bootstrap-select', 'flatui-checkbox'],
function(Sembr, Backbone, Marionette, $, Place, Places, template) {
  //ItemView provides some default rendering logic
  return Backbone.Marionette.ItemView.extend( {
    template: template,

    model: new Place({}),

    // View Event Handlers
    events: {
        'click [data-action=save]': 'save',
        'click [data-action=cancel]': 'cancel',

        'change [data-action=show-subplace]': 'showSubplace'
    },

    ui: {
        formView: '[data-view="form"]',
        successView: '[data-view="success"]'
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
        this._modelBinder = new Backbone.ModelBinder();
        if(!this.collection){
            console.log('getting places');
          this.collection = (opts && opts.collection) ? opts.collection : new Places();
          this.collection.fetch().then(function(places){ console.log('Got places', places); this.render() }.bind(this));
        }
    },

    onRender: function(){
        this.bindForm();
        this.$('.selectpicker').selectpicker({style: 'btn-info', menuStyle: 'dropdown-inverse'});

        this.$('#subplace-of').removeAttr('hidden').hide();
        this.ui.successView.removeAttr('hidden').hide()
    },

    showSubplace: function($ev){

        var $check = $($ev.currentTarget);
        var $control = this.$('#subplace-of');
        console.log('hide/show', $check.attr('checked'));
        $check.attr('checked') ? $control.show() : $control.hide();
    },

    serializeData: function(){
      var data = {};
      data = this.model.toJSON();
      data.places = this.collection;
      return data;
    },

    save: function(){
        console.log("Save");
        //console.log('Save the model: ', this.model.toJSON());
        this.collection.create(this.model.toJSON(), {wait: true, success:function(){
                this.model.clear();
                this.ui.formView.hide();
                this.ui.successView.show();
            }.bind(this)
        });
    },

    newModel: function(planting){
        this.model.clear();
    },

    cancel: function(){
        this.trigger('cancel');
    },

    bindForm: function () {
        var bindings = Backbone.ModelBinder.createDefaultBindings(this.el, 'data-model');
        this._modelBinder.bind(this.model, this.el, bindings);
    }

  });
});