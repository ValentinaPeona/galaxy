/**
    This class creates a form input element wrapper
*/
define([], function() {
    return Backbone.View.extend({
        initialize: function(app, options) {
            // link app
            this.app = app;

            // set text labels and icons for optional button
            this.text_enable    = app.options.text_enable || 'Enable';
            this.text_disable   = app.options.text_disable || 'Disable';
            this.cls_enable     = app.options.cls_enable || 'fa fa-caret-square-o-down';
            this.cls_disable    = app.options.cls_disable || 'fa fa-caret-square-o-up';

            // link field
            this.field = options.field;
            this.default_value = options.default_value;

            // set element
            this.setElement(this._template(options));

            // link elements
            this.$field = this.$el.find('.ui-table-form-field');
            this.$optional = this.$el.find('.ui-table-form-optional');
            this.$optional_icon = this.$el.find('.ui-table-form-optional').find('.icon');
            this.$error_text = this.$el.find('.ui-table-form-error-text');
            this.$error = this.$el.find('.ui-table-form-error');

            // add field element
            this.$field.prepend(this.field.$el);

            // decide wether to expand or collapse optional fields
            this.field.collapsed =  options.collapsible && options.value &&
                                    JSON.stringify(options.value) == JSON.stringify(options.collapsible_value);

            // refresh view
            this._refresh();

            // add optional hide/show
            var self = this;
            this.$optional.on('click', function() {
                // flip flag
                self.field.collapsed = !self.field.collapsed;

                // refresh view
                self._refresh();

                // refresh state
                self.app.trigger('change');
            });
        },

        /** Set error text
        */
        error: function(text) {
            this.$error_text.html(text);
            this.$error.show();
            this.$el.addClass('ui-error');
        },

        /** Reset this view
        */
        reset: function() {
            this.$error.hide();
            this.$el.removeClass('ui-error');
        },

        /** Refresh element
        */
        _refresh: function() {
            // reset optional button
            this.$optional_icon.removeClass().addClass('icon');

            // identify state
            if (!this.field.collapsed) {
                // enable input field
                this.$field.fadeIn('fast');
                this._tooltip(this.text_disable, this.cls_disable);
                this.app.trigger('change');
            } else {
                // disable input field
                this.$field.hide();
                this._tooltip(this.text_enable, this.cls_enable);
                this.field.value && this.field.value(this.default_value);
            }
        },

        /** Set tooltip text
        */
        _tooltip: function(title, cls) {
            if (this.$optional.length) {
                this.$optional_icon.addClass(cls)
                                   .tooltip({ placement: 'bottom' })
                                   .attr('data-original-title', title)
                                   .tooltip('fixTitle').tooltip('hide');
            }
        },

        /** Main Template
        */
        _template: function(options) {
            // create table element
            var tmp =   '<div class="ui-table-form-element">' +
                            '<div class="ui-table-form-error ui-error">' +
                                '<span class="fa fa-arrow-down"/><span class="ui-table-form-error-text"/>' +
                            '</div>' +
                            '<div class="ui-table-form-title">';

            // is optional
            if (options.collapsible) {
                tmp +=          '<div class="ui-table-form-optional">' +
                                    '<i class="icon"/>' + options.label +
                                '</div>';
            } else {
                tmp += options.label;
            }

            // finalize title
            tmp +=          '</div>' +
                            '<div class="ui-table-form-field">';

            // add help
            tmp +=              '<div class="ui-table-form-info">';
            if (options.help) {
                tmp +=              options.help;
            }
            tmp +=              '</div>';
            
            // finalize
            tmp +=          '</div>' +
                        '</div>';

            // return input element
            return tmp;
        }
    });
});