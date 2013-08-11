/** 
 * SembrModel class
 *
 * Defines a model class which can autoload it's dependencies. 
 **/
define(["jquery", "backbone", 'backbone.pouch', 'backbone.deep-model'],
function($, Backbone, Pouch, DM, ) {
  var SembrModel = Backbone.RelationalModel.extend({

    /**
     *
     */
    fetchRelatedJSON: function(){

    }

  });

  return SembrModel;

});