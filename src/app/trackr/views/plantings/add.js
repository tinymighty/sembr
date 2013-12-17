define( ['sembr', 'backbone', 'marionette', 'jquery',
'trackr/views/places/treeview', 'trackr/views/plantings/add/place-summary',
'hbs!./add.tpl', 'hbs!./add/search_message.tpl'],
function(sembr, Backbone, Marionette, $, 
PlacesTree, PlaceSummary,
template, searchMessageTemplate) {
  //ItemView provides some default rendering logic
  return Backbone.Marionette.ItemView.extend( {
	template: template,

	// View Event Handlers
	events: {
		'click [data-action=save]': 'save',
		'click [data-action=clear]': 'clear',
		'click a.place.name': 'setPlace'
	},

	ui:{
		plantSearch: '.ui.plant.search',
		placeSelect: '.place.selection',
		placeInput: '.place.id',
		plantSearchPrompt: '.plant.search .prompt',
		placeSummary: '.place.summary',
		whenInput: '.date.planted'
	},

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
		this.plants = sembr.trackr.plants;
		this.plantsPromise = this.plants.fetch();
		//this.listenTo(this.places, 'change', this.render);
		sembr.log('Places: ',opts.places);

		if(!this.model.get('date')){
			this.model.set('date', new Date().toString());
		}

		this.views = {
			placesTree: new PlacesTree({collection: this.places}),
			placeSummary: new PlaceSummary()
		}
	},

	onRender: function(){
		this.bindForm();
		var ids, names, plants;
		ids = _(this.plants.toJSON())
			.pluck('_id')
		;
		names = _(this.plants.toJSON())
			.pluck('use_name')
		;
		plants = _(this.plants.toJSON())
			.chain()
			.map(function(p){
				return {label: p.use_name, value:p.id};
			})
			.value()
		;
		console.log( "PLANTS", plants );

		$.fn.search.settings.templates.input = function(response){
			var
				html = ''
			;
			if(response.results !== undefined) {
				// each result
				$.each(response.results, function(index, result) {
					if(result.label && result.value){
					  html  += '<a class="result">';
					  if(result.image !== undefined) {
						html+= ''
						  + '<div class="image">'
						  + ' <img src="' + result.image + '">'
						  + '</div>'
						;
					  }
					  html += '<div class="title" data-value="'+result.value+'">'+result.label+'</div>';
					  html  += ''
						+ '</div>'
						+ '</a>'
					  ;
					}
				});
				return html;
			}
			return false;
		};

		this.ui.plantSearch.search(plants, {
			type: 'input',
			searchFields: ['label'],
			onSelect: function(){
				console.log('Item selected', arguments);
				return 'default';
			},
			onResultsOpen: _(function(){
				console.log('Results opened');
				this.ui.plantSearch.find('.results .add.button').click(function(ev){
					ev.preventDefault();
					ev.stopPropagation();
					ev.stopImmediatePropagation();
					console.log('ADD IT', arguments);
				});
			}).bind(this),
			templates:{
				message: function(message, type){
					return searchMessageTemplate({message: message, type:type});
				}
			}
		});

		this.ui.plantSearchPrompt.on('change', function(){
			console.log('Plant search field change!');
		})


		this.ui.placeSelect.append( this.views.placesTree.render().$el );

		this.$('.ui.selection.dropdown')
			.dropdown({onChange: function(){ $(this).find('input').trigger('change'); } })
    ;

    this.ui.placeSummary.append( this.views.placeSummary.render().$el );
	},

	setPlace: function(ev){
		var 
			$el = $(ev.target),
			_id = $el.attr('data-_id')
		;
		this.ui.placeInput.val(_id);
		this.ui.placeSelect.find('.item.active').removeClass('active');
		$el.parent('.item').addClass('active');
		this.views.placeSummary.model = sembr.trackr.allPlaces.get(_id);
		this.views.placeSummary.render();
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