define( ['sembr', 'backbone', 'marionette', 'jquery', 
'hbs!./add.tpl', 
'bootstrap-select'],
function(sembr, Backbone, Marionette, $, template) {
  //ItemView provides some default rendering logic
  return Backbone.Marionette.ItemView.extend( {
    template: template,

    // View Event Handlers
    events: {
        'click [data-action=save]': 'save',
        'click [data-action=clear]': 'clear'
    },

    ui:{
        placeField: '#place-picker',
        plantField: '#plant-picker'
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
        this.model = new sembr.trackr.models.Planting();
        this._modelBinder = new Backbone.ModelBinder();
        if(!this.collection){
          this.collection = (opts && opts.collection) ? opts.collection : new sembr.trackr.collections.Plantings();
        }
        //can we come up with more decoupled dependency management than this? RequestReponse maybe?
        if(!opts.places){
            throw 'No places collection was provided to add.js';
        }
        this.places = sembr.trackr.places; //the cached user places collection
        this.plants = new sembr.trackr.collections.Plants();
        this.plantsPromise = this.plants.fetch();
        //this.listenTo(this.places, 'change', this.render);
        sembr.log('Places: ',opts.places);
    },

    onRender: function(){
        this.bindForm();
        this.ui.plantField.typeahead({
            source: function(query, cb){
                this.plantsPromise.then(function(plants){
                    var arr = _(plants.toJSON()).chain().filter(function(plant){
                        return plant.use_name.toLowerCase().match(query.toLowerCase());
                    }).pluck('use_name').value() || [];
                    sembr.log('Typeahead: ', query, arr);
                    cb( arr );
                });
            }.bind(this)
        })
        this.$('.selectpicker').selectpicker({style: 'btn-info', menuStyle: 'dropdown-inverse'});
    },

    serializeData: function(){
      var data = {};
      data.model = this.model.toJSON();
      data.places = this.places.toJSON();
      return data;
    },

    save: function(){
        sembr.log('Save the model: ', this.model.toJSON());
        this.collection.create(this.model.toJSON(), {wait: true, success:_(this.newModel).bind(this)});
    },

    newModel: function(planting){
        this.model.clear();
    },

    clear: function(){
        this.model.clear();
    },

    bindForm: function () {
        sembr.log('Render QuickAdd view: ',this);

        var bindings = Backbone.ModelBinder.createDefaultBindings(this.el, 'data-model');
        sembr.log(bindings);
        this._modelBinder.bind(this.model, this.el, bindings);
    }

  });
});