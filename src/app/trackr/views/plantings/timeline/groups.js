define( ['sembr', 'backbone', 'marionette', 'jquery', 
'trackr/views/plantings/timeline/group'],
function(sembr, Backbone, Marionette, $, Item) {
  //ItemView provides some default rendering logic
  return Backbone.Marionette.CollectionView.extend( {

    itemView: Item,

    attributes:{
      class: 'groups'
    },
    // View Event Handlers
    events: {

    },

    initialize: function(options){
      if(!options.timeline){
        throw new Error('timeline/plantings view needs access to the timeline view instance via the timeline option.');
      }
      this.timeline = options.timeline;

      this.collection = this.timeline.collections.groups;

      this.collection.on('add', function(planting){
        //this.update();
      });
      this.collection.on('remove', function(planting){
        //this.update();
      });


    },
    
    onRender: function(){
      console.log('Rendering plantings for timeline...');
    },

    onBeforeItemAdded: function(){

    },
    onAfterItemAdded: function(){

    },

    onItemRemoved: function(){

    },

    hide: function(){
      var deferred = new $.Deferred();
      this.$el.transition('scale out', '0.5s', function(){
        deferred.resolve();
      });
      return deferred.promise();
    },

    show: function(){
      var deferred = new $.Deferred();
      this.$el.transition('scale in', '0.5s', function(){
        deferred.resolve();
      });
      return deferred.promise();
    },

    isVisible: function(){
      return this.$el.transition('is visible');
    },

    /*_group: function(){
      var groups = this.collection.groupBy(function(model){
        var group;
        switch(this.options.groupBy){
          case 'plant':
            return model.plant().get('_id');
          case 'place':
            return (model.plant()) ? model.plant().get('_id') : null; //place can be undefined
            break;
        }
      }.bind(this));

      _(groups).each(function(group){

      });

      this.groups.add( new Backbone.Model({}) )

      this.children.each(function(){

      });
    },*/

    onClose: function(){
      //sembr.log('plantings list view closed.');
    }

  });
});