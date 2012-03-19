/**
 * jQuery Django HashMapper plugin v0.1
 *
 * Copyright (c) 2012, Eric Buckley
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 * Redistributions of source code must retain the above copyright notice, this list
 * of conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this
 * list of conditions and the following disclaimer in the documentation and/or other
 * materials provided with the distribution.
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 * IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 * NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 * WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

/*!
 * jQuery lightweight plugin boilerplate
 * Original author: @ajpiano
 * Further changes, comments: @addyosmani
 * Licensed under the MIT license
 */

// the semi-colon before the function invocation is a safety
// net against concatenated scripts and/or other plugins
// that are not closed properly.
;(function($, window, document, undefined) {

    // undefined is used here as the undefined global
    // variable in ECMAScript 3 and is mutable (i.e. it can
    // be changed by someone else). undefined isn't really
    // being passed in so we can ensure that its value is
    // truly undefined. In ES5, undefined can no longer be
    // modified.

    // window and document are passed through as local
    // variables rather than as globals, because this (slightly)
    // quickens the resolution process and can be more
    // efficiently minified (especially when both are
    // regularly referenced in your plugin).

    // Create the defaults once
    var pluginName = 'hashmapper';

    // The actual plugin constructor
    var Plugin = function(elem, options) {
        var base = this;
        base.elem = elem;
        base.$elem = $(elem);
        base.options = options;
        base._name = pluginName;

        base.defaults = {
            keyName: "key",
            keyClasses: "",
            valueName: "value",
            valueClasses: "",
            submitEvent: "submit",
            placeholderMessage: "Add a mapping"
        };

        base.init = function () {
            // Place initialization logic here
            // You already have access to the DOM element and
            // the options via the instance, e.g. base.$elem
            // and base.options
            console.log(base);
            base.config = $.extend({}, base.defaults, base.options);

            var container = base.createContainer();
            base.$elem.closest("form").bind(base.config.submitEvent, function () {
                var data = { };
                container.find(".hm-item").each(function( ) {
                    var li = $(this),
                        key = li.find(".hm-key").val(),
                        value = li.find(".hm-value").val();
                    data[key] = value;
                });
                base.$elem.val(JSON.stringify(data));
            });

            base.$elem.hide();
            base.$elem.after(container);

            return base;
        };

        base.createContainer = function () {
            var container = $("<div/>", {"class": "hm-container"}),
                table = $("<table/>", {"class": "tabular"}),
                header = $("<tr/>"),
                data = $.parseJSON(base.$elem.val()),
                index = 0;
            header.append($("<th/>", { text: base.config.keyName }));
            header.append($("<th/>", { text: base.config.valueName }));
            header.append($("<th/>"));
            table.append($("<thead/>").append(header));
            table.append($("<tfoot/>"));
            table.append($("<tbody/>"));

            /* set initial data values */
            for(var key in data) {
                if(data.hasOwnProperty(key)) {
                    index++;
                    base.attachFieldRow(table, key, data[key], true);
                }
            }
            /* if no data, create an empty row */
            if (index === 0) {
                base.attachPlaceholderRowIfEmpty(table);
            }
            container.append(table);
            base.attachAddLink(container, table);
            return container;
        };

        base.attachFieldRow = function(table, key, value, canDelete) {
            var tbody = table.find("tbody"),
                numOfRows = tbody.find("tr").length,
                rowClass = numOfRows % 2 === 0 ? "row1" : "row2",
                row = $("<tr/>", {"class": "hm-item " + rowClass}),
                keyClasses = base.config.keyClasses.replace(',', ' '),
                valueClasses = base.config.valueClasses.replace(',', ' ');

            row.append($("<td/>").append(
                $("<input/>", {
                    type: "text",
                    "class": "hm-key " + keyClasses,
                    "value": key
                })
            ));
            row.append($("<td/>").append(
                $("<input/>", {
                    type: "text",
                    "class": "hm-value " + valueClasses,
                    value: value
                })
            ));
            if (canDelete) {
                row.append($("<td/>").append(
                    $("<a/>", {
                        href: "#",
                        "class": "deletelink",
                        click: function () {
                            row.remove();
                            base.attachPlaceholderRowIfEmpty(table);
                            return false;
                        }
                    })
                ));
            } else {
                row.append($("<td/>"));
            }
            table.find("tbody").append(row);
            row.toggle().toggle(); /* force a redraw */
        };

        base.attachPlaceholderRowIfEmpty = function(table) {
            /* not actually a row, but a placeholder to indicate nothing
             * has been mapped. */
            var tbody = table.find("tbody"),
                numOfRows = tbody.find("tr").length,
                row = null;
            if (!numOfRows) {
                row = $("<tr/>", {
                    "class": "row1 hm-placeholder"
                });
                row.append($("<td/>", {
                        "colspan": "3",
                        "text": base.config.placeholderMessage
                    })
                );
                tbody.append(row);
                row.toggle().toggle(); /* force a redraw */
            }
        };

        base.attachAddLink = function(container, table) {
            var td = $("<td/>", { colspan: "3"}).append(
                $("<a/>", {
                    href: "#",
                    text: "Add field",
                    click: function () {
                        table.find(".hm-placeholder").remove();
                        base.attachFieldRow(table, null, null, true);
                        return false;
                    }
                })
            );
            table.find("tfoot").append(
                    $("<tr/>", {"class": "add-row"}).append(td));
        };

        base.init();
    };

    // A really lightweight plugin wrapper around the constructor,
    // preventing against multiple instantiations
    $.fn[pluginName] = function ( options ) {
        console.log(this);
        var dataName = "plugin_" + pluginName;
        return this.each(function () {
            if (!$.data(this, dataName)) {
                $.data(this, dataName, new Plugin(this, options));
            }
        });
    };

})(jQuery, window, document);
