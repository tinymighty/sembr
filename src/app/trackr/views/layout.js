define( ['sembr', 'backbone', 'marionette', 'hbs!./layout.tpl'],
function(sembr, Backbone, Marionette, template) {
    //ItemView provides some default rendering logic
    var PlantingsLayout = Backbone.Marionette.Layout.extend( {
        template: template,
        
        regions:{
            main: '#layout-main',
            sidebar: '#layout-sidebar'
        },

        onBeforeClose: function(){
        	sembr.log('Trying to close the Plantings layout.')
        	//@todo: this is a total zombie maker. We need to check if this view should be persisted
        	return false;
        }
    });


    return PlantingsLayout;
});