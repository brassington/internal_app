/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Owner: mark@famo.us
 * @license MPL 2.0
 * @copyright Famous Industries, Inc. 2014
 */

define(function(require, exports, module) {
    var Scene = require('famous/core/Scene');
    var Surface = require('famous/core/Surface');
    var Transform = require('famous/core/Transform');
    var View = require('famous/core/View');

    var StateModifier = require('famous/modifiers/StateModifier');

    var FlexibleLayout = require('famous/views/FlexibleLayout');
    var SequentialLayout = require('famous/views/SequentialLayout');

    /**
     * A view for displaying the title of the current page
     *  as well as icons for navigating backwards and opening
     *  further options
     *
     * @class NavigationBar
     * @extends View
     * @constructor
     *
     * @param {object} [options] overrides of default options
     * @param {Array.number} [options.size=(undefined,0.5)] Size of the navigation bar and it's componenets.
     * @param {Array.string} [options.backClasses=(back)] CSS Classes attached to back of Navigation.
     * @param {String} [options.backContent=(&#x25c0;)] Content of the back button.
     * @param {Array.string} [options.classes=(navigation)] CSS Classes attached to the surfaces.
     * @param {String} [options.content] Content to pass into title bar.
     * @param {Array.string} [options.classes=(more)] CSS Classes attached to the More surface.
     * @param {String} [options.moreContent=(&#x271a;)] Content of the more button.
     */
    function NavigationBar(options) {
        View.apply(this, arguments);

        this.title = new Surface({
            classes: this.options.classes,
            content: this.options.content
        });
        this.title.View = new View();
        this.title.PositionModifier = new StateModifier();
        this.title.OpacityModifier = new StateModifier();
        this.title.View.add(this.title.PositionModifier).add(this.title.OpacityModifier).add(this.title);

        if(this.options.back){
            this.back = this.options.back;
        } else {
            this.back = new Surface({
                size: [20, this.options.size[1]], // changed width from: this.options.size[1]
                classes: this.options.backClasses,
                content: this.options.backContent
            });
        }
        this.back.View = new View();
        this.back.PositionModifier = new StateModifier();
        this.back.OpacityModifier = new StateModifier();
        this.back.View.add(this.back.PositionModifier).add(this.back.OpacityModifier).add(this.back);

        if(this.options.backContent === false){
            this.back.setSize([0,0]); 
        }
        this.back.on('click', function() {
            this._eventOutput.emit('back', {});
        }.bind(this));

        // How to layout the icons?
        if(this.options.moreSurfaces){
            // array of surfaces, create a FlexibleLayout to hold them
            this.more = new View();
            this.more.Grid = new SequentialLayout({
                direction: 0,
                // ratios: _.map(_.range(this.options.moreSurfaces.length), function(){return true;}) // [true, true, ...]
            });
            this.more.add(this.more.Grid);
            this.more.Grid.sequenceFrom(this.options.moreSurfaces);
        } else if(this.options.more){
            this.more = this.options.more;
        } else {
            // Use default
            this.more = this.options.more || new Surface({
                size: [this.options.size[1], this.options.size[1]],
                classes: this.options.moreClasses,
                content: this.options.moreContent
            });
            // if(typeof this.options.moreContent == typeof "string"){
                this.more.on('click', function() {
                    this._eventOutput.emit('more', {});
                }.bind(this));
            // }

        }
        this.more.View = new View();
        this.more.PositionModifier = new StateModifier();
        this.more.OpacityModifier = new StateModifier();
        this.more.View.add(this.more.PositionModifier).add(this.more.OpacityModifier).add(this.more);

        // this.layout = new Scene({
        //     id: 'master',
        //     size: this.options.size,
        //     target: [
        //         {
        //             transform: Transform.inFront,
        //             origin: [0, 0.5],
        //             target: this.back
        //         },
        //         {
        //             origin: [0.5, 0.5],
        //             target: this.title
        //         },
        //         {
        //             transform: Transform.inFront,
        //             origin: [1, 0.5],
        //             target: this.more
        //         }
        //     ]
        // });

        this.layout = new FlexibleLayout({
            ratios: [true, 1, true]
        });
        this.layout.sequenceFrom([
            this.back.View,
            this.title.View,
            this.more.View
        ]);

        this._add(this.layout);

        this._optionsManager.on('change', function(event) {
            var key = event.id;
            var data = event.value;
            if (key === 'size') {
                this.layout.id.master.setSize(data);
                this.title.setSize(data);
                this.back.setSize([data[1], data[1]]);
                this.more.setSize([data[1], data[1]]);
            }
            else if (key === 'backClasses') {
                this.back.setOptions({classes: this.options.classes.concat(this.options.backClasses)});
            }
            else if (key === 'backContent') {
                this.back.setContent(this.options.backContent);
            }
            else if (key === 'classes') {
                this.title.setOptions({classes: this.options.classes});
                this.back.setOptions({classes: this.options.classes.concat(this.options.backClasses)});
                this.more.setOptions({classes: this.options.classes.concat(this.options.moreClasses)});
            }
            else if (key === 'content') {
                this.setContent(this.options.content);
            }
            else if (key === 'moreClasses') {
                this.more.setOptions({classes: this.options.classes.concat(this.options.moreClasses)});
            }
            else if (key === 'moreContent') {
                this.more.setContent(this.options.content);
            }
        }.bind(this));
    }

    NavigationBar.prototype = Object.create(View.prototype);
    NavigationBar.prototype.constructor = NavigationBar;

    NavigationBar.DEFAULT_OPTIONS = {
        size: [undefined, 50],
        backClasses: ['back'],
        // backContent: '&#x25c0;',
        backContent: '<i class="icon ion-android-arrow-back"></i>',
        classes: ['navigation'],
        content: '',
        moreClasses: ['more'],
        moreContent: '&#x271a;'
    };

    /**
     * Set the title of the NavigationBar
     *
     * @method setContent
     *
     * @param {object} content JSON object containing title information
     *
     * @return {undefined}
     */
    NavigationBar.prototype.setContent = function setContent(content) {
        return this.title.setContent(content);
    };

    module.exports = NavigationBar;
});
