define( ['sembr', 'backbone', 'sembr.ractiveview', 'jquery', 'underscore', 'backbone-undo', 'moment',
'rv!./creadit.tpl',
'less!./creadit'],
function( sembr, Backbone, RactiveView, $, _, BackboneUndo, moment,
template ){
  var CreaditPlant = new RactiveView({
    template: template,
    
  });
  
  return CreaditPlant;
});§