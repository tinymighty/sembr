define( ['sembr', 'backbone', 'sembr.ractiveview', 'rv!./dashboard.tpl'],
function(sembr, Backbone, RactiveView, template) {
    "use strict";
    //ItemView provides some default rendering logic
    return RactiveView.extend( {
        template: template
    });
});