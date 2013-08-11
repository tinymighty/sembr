define(['backbone', 'marionette'], function(Backbone, Marionette){
  var ModuleRouter = Backbone.Router.extend({



    constructor: function(options){
      var args = Array.prototype.slice.apply(arguments);
      Backbone.Router.prototype.constructor.apply(this, args);
      //console.log('ModuleRouter options: ',options);
      if(!options || !options.module){
        throw 'Missing module option. Please pass a module instance to the ModuleRouter';
      }
      this.module = options.module;


      this.options = options;

      this.controllerInstances = {};

      if (this.moduleRoutes){
        var controller = Marionette.getOption(this, "controller");
        this.processAppRoutes(controller, this.moduleRoutes);
      }
    },

    // Internal method to process the `appRoutes` for the
    // router, and turn them in to routes that trigger the
    // specified method on the specified `controller`.
    processAppRoutes: function(controller, moduleRoutes){
      var methodName, controller, controllerOpts, func, controllerInst;
      var route, routesLength, i;
      var routes = [];
      var router = this;

      //keeping in mind the prefix can be an empty string for the base module
      var prefix = this.urlPrefix === undefined ? this.module.moduleName : this.urlPrefix;
      if(prefix.length > 0 && prefix[prefix.length]!=='/'){
        prefix += '/';
      }

      for(route in moduleRoutes){
        if (moduleRoutes.hasOwnProperty(route)){
          //console.log(router);
          routes.unshift([prefix+route, moduleRoutes[route] ]);
        }
      }

      routesLength = routes.length;
      for (i = 0; i < routesLength; i++){
        console.log('Adding route', routes[i], i, routesLength);
        if(!routes[i][1].controller.id){
          console.error('No controller id', routes[i][1].controller);
          throw {error: 'Controller must specify a unique id.'};
        }
        /*
        r = route
        c = controller object (not instance)
        mN = methodName on the controller instance
        cO = options
        */
        func = function(route){
          return function(){
            var ci;
            console.log("Matched route!", route,  arguments, Math.random()*1000);
            //console.log('Router controller instances...', router.controllerInstances);
            //if we haven't already got an instance of the controller, make one and save it for later
            if(!router.controllerInstances[ route[1].controller.id ]){
              ci = router.controllerInstances[ route[1].controller.id ] = new route[1].controller( route[1].options )
            }else{
              ci = router.controllerInstances[ route[1].controller.id ]
            }
            if(_(ci['beforeModuleRoute']).isFunction()){
              ci['beforeModuleRoute'].apply(ci, arguments);
            }
            //call the controller method specified for this route, passing along the data from Backbone.Router
            ci[ route[1].method ].apply(ci, arguments);
          }
        }(routes[i]);

        router.route(routes[i][0], (routes[i][1].controller.name||'')+methodName, func);
      }
    }


  });
  return ModuleRouter;
});