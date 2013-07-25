/**
 * A component view which adds a visible/hidden toggle button to a password field, to allow
 * the user to set the password to visible text.
 * @module Components
 * @submodule PasswordToggler
 * @class PasswordToggler
 */
define(['jquery', 'backbone', 'underscore', 'bootstrap'], function($, Backbone, _) {

  return Backbone.View.extend({

    events: {
      'click button': 'toggleClick'
    },
    tagName: 'div',
    className: 'password-toggler input-append'

    ,
    initialize: function() {
      if(this.$el.children().length === 0 && !this.options.template) {
        var field_name = this.options.name === undefined ? '' : this.options.name;
        this.$password = $('<input type="password" name="' + field_name + '">').appendTo(this.$el);
        this.$text = $('<input type="text">').appendTo(this.$el);
        this.$toggler = $('<button class="btn" title="Show/Hide Password" data-toggle="button"><i class="icon-eye-open"></i></button>').appendTo(this.$el);
      } else {
        this.$password = this.$('input[type=password]');
        this.$text = this.$('input[type=text]');
        this.$toggler = this.$('button');
      }
      this.$toggler.tooltip();

      //make the two fields always contain the same value
      this.$('input').keyup(function() {
        $(this).siblings('input').val($(this).val());
      });
      /*
      <div class="input-append password-toggler hide-password" id="signup-password-hidden">
        <input id="signup-new-password" name="new-password" type="password">
        <input type="text">
        <button class="btn" title="Show/Hide Password" data-toggle="button"><i class="icon-eye-open"></i></button>
      </div>
       */
    }

    ,
    toggleClick: function(ev) {
      ev.preventDefault();
      this.toggle();
    },
    toggle: function() {
      if(this.$el.hasClass('show-password')) {
        this.$el.removeClass('show-password').addClass('hide-password');
        this.$text.hide();
        this.$password.show();
        this.$toggler.find('i').removeClass('icon-eye-close').addClass('icon-eye-open');
      } else {
        this.$el.removeClass('hide-password').addClass('show-password');
        this.$text.show();
        this.$password.hide();
        this.$toggler.find('i').removeClass('icon-eye-open').addClass('icon-eye-close');
      }
    }

  });

});