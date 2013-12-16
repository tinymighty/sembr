define( ['sembr', 'backbone', 'marionette', 'jquery', 
'trackr/views/plantings/timeline/planting'],
function(sembr, Backbone, Marionette, $, ListItem) {
  //ItemView provides some default rendering logic
  return Backbone.Marionette.CollectionView.extend( {

    itemView: ListItem,

    attributes:{
      class: 'plantings'
    },
    // View Event Handlers
    events: {

    },

    ui:{
      groups: '.groups'
    },

    initialize: function(options){
      if(!options.timeline){
        throw new Error('timeline/plantings view needs access to the timeline view instance via the timeline option.');
      }
      this.timeline = options.timeline;
      this.options = _(this.timeline.options).defaults({

      });
      this.$el.attr('data-group_by',this.options.groupBy);

      this.collection = this.timeline.collections.plantings;

      this.collection.on('add', function(planting){
        this.update();
      });
      this.collection.on('remove', function(planting){
        this.update();
      });

      this.groups = new Backbone.Collection();

      //sembr.log(this.collection.models);
      /*this.groupedBy = {
        plant: new Backbone.Collection( 
          this.collection
            .chain()
            .groupBy(function(model){
              return model.plant().get('_id');
            })
            .each(function(group, _id, groups){
              groups[_id] = Backbone.Collection(group);
            })
            .value()
          //
        ),
        place: new Backbone.Collection(
          this.collection
            .chain()
            .groupBy(function(model){
              if(model.place && model.place()){
                return model.place().get('_id');
              }else{
                return null; //places can be undefined...
              }
            })
            .each(function(group, _id, groups){
              groups[_id] = Backbone.Collection(group);
            })
            .value()
          //
        )
      };

      //when a new planting is added
      this.timeline.plantings.on('add', function(planting){
        this.groupedBy.plant[ planting.plant().get('_id') ].add( planting );

        var place = planting.place() ? planting.place().get('_id') : null;
        this.groupedBy.place[ place ].a
      });

      this.timeline.plantings.on('remove', function(planting){

      });
*/

    },
    

    onRender: function(){
      console.log('Rendering plantings for timeline...');
    },

    onAfterItemAdded: function(){

    },

    onItemRemoved: function(){

    },

    onClose: function(){
      //sembr.log('plantings list view closed.');
    }

  });
});