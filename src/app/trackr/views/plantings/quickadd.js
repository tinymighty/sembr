define( ['sembr', 'backbone', 'marionette', 'jquery', 
'hbs!./quickadd.tpl', 
'bootstrap-select'],
function(sembr, Backbone, Marionette, $, template) {
  //ItemView provides some default rendering logic
  return Backbone.Marionette.ItemView.extend( {
    template: template,

    model: new Planting({}),

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
        this.placesCollection = new PlacesCollection();
        this.placesCollection.fetch().then(function(){this.render()}.bind(this));
    },

    onRender: function(){
        this.bindForm();
        this.$('.selectpicker').selectpicker({style: 'btn-info', menuStyle: 'dropdown-inverse'});
    },

    serializeData: function(){
      var data = {};
      data = this.model.toJSON();
      data.places = this.placesCollection.models;
      return data;
    },

    save: function(){
        //console.log('Save the model: ', this.model.toJSON());
        this.collection.create(this.model.toJSON(), {wait: true, success:_(this.newModel).bind(this)});
    },

    newModel: function(planting){
        this.model.clear();
    },

    clear: function(){
        this.model.clear();
    },

    bindForm: function () {
        //console.log('Render QuickAdd view: ',this);

        var bindings = Backbone.ModelBinder.createDefaultBindings(this.el, 'data-model');
        console.log(bindings);
        this._modelBinder.bind(this.model, this.el, bindings);
    }

  });
});