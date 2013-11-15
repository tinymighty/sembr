define( ['require', 'sembr', 'backbone', 'marionette', 'jquery', 
'../../models/planting.js', '../../collections/plantings.js', 'hbs!./add.tpl', 
'bootstrap-select'],
function(require, Sembr, Backbone, Marionette, $, Planting, Plantings, template) {
  //ItemView provides some default rendering logic
  return Backbone.Marionette.ItemView.extend( {
    template: template,

    model: new Planting(),

    // View Event Handlers
    events: {
        'click [data-action=save]': 'save',
        'click [data-action=clear]': 'clear'
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
          this.collection = (opts && opts.collection) ? opts.collection : new Plantings();
        }
        //can we come up with more decoupled dependency management than this? RequestReponse maybe?
        if(!opts.places){
            throw 'No places collection was provided to add.js';
        }
        this.places = opts.places;
        this.listenTo(this.places, 'change', this.render);
        console.log('Places: ',opts.places);
    },

    onRender: function(){
        this.bindForm();
        this.$('.selectpicker').selectpicker({style: 'btn-info', menuStyle: 'dropdown-inverse'});
    },

    serializeData: function(){
      var data = {};
      data = this.model.toJSON();
      data.places = this.places.toJSON();
      return data;
    },

    save: function(){
        console.log('Save the model: ', this.model.toJSON());
        this.collection.create(this.model.toJSON(), {wait: true, success:_(this.newModel).bind(this)});
    },

    newModel: function(planting){
        this.model.clear();
    },

    clear: function(){
        this.model.clear();
    },

    bindForm: function () {
        console.log('Render QuickAdd view: ',this);

        var bindings = Backbone.ModelBinder.createDefaultBindings(this.el, 'data-model');
        console.log(bindings);
        this._modelBinder.bind(this.model, this.el, bindings);
    }

  });
});