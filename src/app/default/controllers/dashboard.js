define(['sembr', 'backbone', 'sembr.controller'],
function (sembr, Backbone, Controller) {
    return Controller.extend({

        //gets mapped to in AppRouter's appRoutes
        home: function() {
            //sembr.layout.setContent(new DashboardView());
        }
    });
});