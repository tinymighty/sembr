define( [
  'sembr', 'sembr.ractiveview', 
  'text!./list.tpl.html'],
function(
  sembr, RactiveView, 
  template
){

  return RactiveView.extend({

    template: template,

    initialize: function( options ){
      this.set('plantings', options.plantings );
    }

  });

});
