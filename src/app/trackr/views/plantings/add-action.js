define( ['sembr', 'backbone', 'marionette', 'jquery', '../../models/action.js', 'hbs!./add-action.tpl',
'jqueryui'],
function(Sembr, Backbone, Marionette, $, ActionModel, template) {
  //ItemView provides some default rendering logic
  return Backbone.Marionette.ItemView.extend( {
    /*tagName: 'div',
    className: 'planting-action',*/
    template: template,

    // View Event Handlers
    events: {
        'click [data-action="save"]': 'createAction',
    },

    initialize: function(opts){
        if(!opts.planting){
            throw 'add-action view requires a Planting model'
        }
        if(!this.collection){
            throw 'add-action view requires a PlantingAction collection'
        }
        this.planting = opts.planting;
        this.modelBinder = new Backbone.ModelBinder();
        this.prefilModelData = {
            'date': new Date().toString(),
            'action_type': 'harvest',
            'subject_type': 'planting',
            'subject_id': this.planting.get('_id')
        };    
        this.model = new ActionModel(this.prefillModelData);

    },

    createAction: function(){
        var values = this.model.toJSON();
        this.collection.create( values, {wait:true, success: _(this.createdAction).bind(this) });
    },

    createdAction: function(action){
        this.model.clear();
        this.model.set(this.prefillModelData);
    },

    onRender: function(){
        this.bind();
        this.$('.selectpicker').selectpicker({style: 'btn-info', menuStyle: 'dropdown-inverse'});

        //console.log(this.$('#add-action-date'));
        // jQuery UI Datepicker JS init
        var datepickerSelector = '#add-action-date';
        this.$(datepickerSelector).datepicker({
          showOtherMonths: true,
          selectOtherMonths: true,
          dateFormat: "d MM, yy",
          yearRange: '-1:+1'
        }).prev('.btn').on('click', function (e) {
          e && e.preventDefault();
          $(datepickerSelector).focus();
        });

        // Now let's align datepicker with the prepend button
        $(datepickerSelector).datepicker('widget').css({'margin-left': -$(datepickerSelector).prev('.btn').outerWidth() - 2});
    },

    bind: function () {
        var bindings = Backbone.ModelBinder.createDefaultBindings(this.el, 'data-model');
        this.modelBinder.bind(this.model, this.$el, bindings);
    }

  });
});