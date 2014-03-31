define(['sembr', 'backbone', 'sembr.controller', 'default/views/dashboard'],
function (sembr, Backbone, Controller, DashboardView) {
  "use strict";
  return Controller.extend({

      //gets mapped to in AppRouter's appRoutes
      home: function() {
      		var dashboard = new DashboardView();
      		console.log('SHOWING DASHBOARD', dashboard);
          sembr.base.setContent( dashboard );
      }
  });
});