define(['sembr', 'jquery', 'backbone', 'marionette', 'hbs!../templates/header'],
    function (sembr, $, Backbone, Marionette, template) {
        //ItemView provides some default rendering logic
        return Backbone.Marionette.ItemView.extend({
            template:template,

            events: {
            	'click a': 'menuClick'
            },

            currentModule: '',

            initialize:function(){
                this.listenTo(sembr.vent, 'route', function(name, params, module){
                    this.currentModule = module;
                    this.setActiveItem(name);
                });
            },

            onRender: function(){

            },

            setActiveItem: function(route_name){
                sembr.log('Setting menu item', name, window.location.pathname, this.$('.item').filter('[href="'+window.location.pathname+'"]'));
                this.$('.item').removeClass('active').filter('[href="'+window.location.pathname+'"]').addClass('active');
            },


            menuClick: function($ev){
            	$ev.preventDefault();
            	sembr.navigate($($ev.target).attr('href'), {trigger:true});
            }
        });
    });