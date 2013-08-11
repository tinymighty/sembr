/** 
 * SembrController class
 *
 * Defines a controller class with a unique id for each class 
 **/
define(["jquery", "backbone", "marionette"], function($, Backbone, Marionette ) {
  var Controller = Marionette.Controller.extend({});//, {idIncrement:0});
  Controller.idIncrement = 0;
  Controller.extend = function(){
    	console.log('Extending Marionette.controller');
    	var c = Marionette.Controller.extend.apply(this, arguments);
    	if(!c.id){
    	  c.id = ++Controller.idIncrement;
    	}
    	console.log('Controller id is ', c.id, c);
      return c;
    

  };
  console.log('Sembr Controller: ',Controller.idIncrement);

  return Controller;

});