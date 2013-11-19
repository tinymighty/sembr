define(['sembr', 'backbone', 'sembr.controller', 'trackr/views/dashboard/dashboard'],
function (sembr, Backbone, Controller, DashboardView, HeaderView) {
    return Controller.extend({

        //gets mapped to in AppRouter's appRoutes
        home: function() {
            sembr.layout.setContent(new DashboardView());
        }
    });
});