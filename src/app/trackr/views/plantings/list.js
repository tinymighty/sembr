define( [
  'sembr', 'sembr.ractiveview', 
  'text!./list.tpl.html'],
function(
  sembr, RactiveView, 
  template
){

  return RactiveView.extend({

    template: template,

    events: {
      'navigate': function(event){
        event.original.preventDefault();
        sembr.navigate( event.node.getAttribute('href'), {trigger:true} );
        return false;
      }
    },

    initialize: function( options ){
      this.set('plantings', options.plantings );
    }

  });

});
