    define( ['sembr', 'backbone', 'marionette', 'jquery', 'hbs!./add-action.tpl',
'jqueryui'],
function(sembr, Backbone, Marionette, $, template) {
  //ItemView provides some default rendering logic
  return Backbone.Marionette.ItemView.extend( {
    /*tagName: 'div',
    className: 'planting-action',*/
    template: template,

    // View Event Handlers
    events: {
        'click [data-action="save"]': 'createAction',
        'change select[data-model=action_type]': 'actionTypeChange'
    },

    ui:{
        actionSelect: 'select[data-model=action_type]',
        actionFields: '.action_fields'
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
        this.prefillModelData = {
            'date': new Date().toString(),
            'subject_id': this.planting.get('_id')
        };    
        this.model = sembr.trackr.models.PlantingAction.create(this.prefillModelData);

    },

    createAction: function(){
        this.saving(true);
        this.model.save()
            .done(function(){
                this.collection.add( this.model );
                this.saving(false);
                this.model = sembr.trackr.models.Action.create(this.prefillModelData);
            }.bind(this))
            .fail(function(){
                console.error('Failed to save action!');
            });
        
    },

    actionTypeChange: function (ev) {
        var $el = $(ev.target);
        this.ui.actionFields.hide();
        this.ui.actionFields.filter('.'+$el.val()+'_fields').show();
    },

    saving: function(toggle){
        toggle ? this.$el.css('opacity', '0.5') : this.$el.css('opacity','');
    },

    onRender: function(){
        this.ui.actionFields.hide().removeAttr('hidden');

        _(this.model.action_types).each(function(type){
            this.ui.actionSelect.append('<option value="'+type+'">'+type+'</option>');
        }, this);
        
        this.bind();
        this.$('.selectpicker').selectpicker({style: 'btn-info', menuStyle: 'dropdown-inverse'});

        //sembr.log(this.$('#add-action-date'));
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