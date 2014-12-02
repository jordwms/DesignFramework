/**
* NOTE: jQuery dependent!
* This script performs several functions with joint purposes related to painting on a canvas.
* 1. Draw on a canvas
* 2. Maintain an image on the canvas when canvas resizes
* 3. Draw a pre-determined image to the canvas
* 4. Clear the canvas
* 5. Saves every time the user stops drawing (to a hidden value)
*
* In order to provide all these abilities, it is expected that the "group" parameter is used across
*   several HTML tags as a class attribute identifier.
* The following elements are expected to be on the HTML document with group name in parentheses:
* 1. <div id="img-frame-outer">
* 2. <div id="img-frame-inner">
* 3. <canvas id="canvas_markup">
* 4. <img id="underlay">
* 5. <input type="hidden" class=[options.group]> this is an optional DOM element
* 6. <input type="button"> OR <button> OR class="btn", id="marker"
* 7. <input type="button"> OR <button> OR class="btn", id="eraser"
*
* "name" is used on the hidden field for form submission in the POST array.
* "hidden" type input should hold a base64 encoded string for an image, like toDataURL() would generate.
*
* This toolset also has functionality for color selection, width selection, canvas resetting and check for whether the canvas has been modified.
*
*   @author  Jordan Williams
*   @link    github.com/jordwms
*   @package DesignFramework
*/
var canvas_markup = function(options) {
    var canvas         = document.getElementById('canvas_markup'),
        ctxt           = canvas.getContext("2d"),
        // Indicate that there are no changes made yet
        modified       = false,
        is_move        = false,
        // This is the only way to keep track of mouse actions
        mouse_id       = 0,
        lines          = [],
        // Default to draw. "destination-out" enables erasing.
        eraser         = "source-over",
        // Any valid hex color value
        color_value    = '#000',
        marker_width   = 4,
        canvas_val     = '',
        offset;

    ctxt.pX = undefined;
    ctxt.pY = undefined;

    var self = {
        init: function() {
            canvas.width  = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;

            self.size_canvas();

            ctxt.lineCap = "round";

            offset = $(canvas).offset();

            // Allows the markup to toggle from eraser back to draw mode.
            document.getElementById('marker').addEventListener('click', function() {
                eraser = "source-over";
            });

            document.getElementById('eraser').addEventListener('click', function() {
                eraser = "destination-out";
            });

            // Load signature if image is found in hidden field
            var img = new Image();

            // Does the element exist? (Not mandatory)
            if ($('input[type="hidden"].'+options.group).length) {
                img.src = $('input[type="hidden"].'+options.group).val();
            }

            img.onload = function() {
                ctxt.drawImage(img, 0, 0);
            };

            // Keep the current image on the canvas when resizing
            $(window).resize(function(){
                // Create a temporary canvas obj to cache the pixel data
                var temp_cnvs = document.createElement('canvas');
                var temp_cntx = temp_cnvs.getContext('2d');

                // Set it to the new width & height and draw the current canvas data into it
                temp_cnvs.width  = canvas.offsetWidth;
                temp_cnvs.height = canvas.offsetHeight;
                temp_cntx.drawImage(canvas, 0, 0);

                // Resize & clear the original canvas and copy back in the cached pixel data
                canvas.width  = canvas.offsetWidth;
                canvas.height = canvas.offsetHeight;

                ctxt.lineCap   = "round";

                ctxt.drawImage(temp_cnvs, 0, 0);

                offset.left = canvas.offsetLeft;
            });

            // Bind click events
            canvas.addEventListener('touchstart', self.pre_move, false);
            canvas.addEventListener('touchmove',  self.move,    false);
            canvas.addEventListener('touchend',   self.save,    false);

            canvas.addEventListener('mousedown', self.mouse_start_move, false);
            canvas.addEventListener('click',     self.mouse_move,      false);
            canvas.addEventListener('mousemove', self.mouse_move,      false);
            window.addEventListener('mouseup',   self.mouse_end_move,   false);
        },

        size_canvas: function(){
            //set the canvas width to the same as the underlying image's full size
            var img    = new Image();

            img.src    = $('#underlay').attr("src");
            img_width  = img.width;
            img_height = img.height;

            $(canvas).css({
                'width': img_width,
                'height': img_height
            });

            $('#img-frame-inner, #img-frame-outer').css({
                'width': img_width,
                'height': img_height
            });
        },

        pre_move: function(event) {
            // Each time the canvas is touched...
            $.each(event.touches, function(i, touch) {
                // Give the touch event an identifier
                var id      = touch.identifier;

                // Determine event's position on the canvas
                lines[id] = {
                                x : this.pageX - offset.left,
                                y : this.pageY - offset.top
                            };
            });

            event.preventDefault();
        },

        move: function(event) {
            $.each(event.touches, function(i, touch) {
                // Dynamically find the position of X,Y
                var id = touch.identifier,
                    moveX = this.pageX - offset.left - lines[id].x + document.getElementById('img-frame-outer').scrollLeft
                    moveY = this.pageY - offset.top - lines[id].y + document.getElementById('img-frame-outer').scrollTop;

                var ret = self.draw(id, moveX, moveY);
                lines[id].x = ret.x;
                lines[id].y = ret.y;
            });

            event.preventDefault();
        },

        draw: function(i, changeX, changeY) {
            // Set the color
            ctxt.strokeStyle              = color_value,
            ctxt.fillStyle                = color_value;
            // Is this eraser-mode?
            ctxt.globalCompositeOperation = eraser;
            // User defined line width
            ctxt.lineWidth                = eraser == "source-over" ? marker_width : 35;

            ctxt.beginPath();

            if(is_move){
                ctxt.moveTo(lines[i-1].x, lines[i-1].y);
            } else {
                ctxt.moveTo(lines[i].x -1, lines[i].y -1);
            }

            ctxt.lineTo(lines[i].x + changeX, lines[i].y + changeY);
            ctxt.stroke();
            ctxt.closePath();

            // Indicate that a valid markup has occurred, useful for save and pulled out for other features.
            modified = true;

            return {
                x: lines[i].x + changeX,
                y: lines[i].y + changeY
            };
        },

        // Write base 64 image to a hidden element so the image can be passed to server
        save: function(event) {
            // If the canvas was changed by drawing thenflag will be set.
            if (modified) {
                canvas_val = canvas.toDataURL();
            }
        },

        mouse_start_move: function(event) {
            //ensure our offsets are correct
            $(window).resize();

            // Position on the canvas found as coords on the page minus the offset of the canvas
            lines[mouse_id] = {
                x : event.pageX - offset.left + document.getElementById('img-frame-outer').scrollLeft,
                y : event.pageY - offset.top + document.getElementById('img-frame-outer').scrollTop
            };

            var moveX = event.pageX - offset.left - lines[mouse_id].x + document.getElementById('img-frame-outer').scrollLeft,
                moveY = event.pageY - offset.top - lines[mouse_id].y + document.getElementById('img-frame-outer').scrollTop;

            var ret = self.draw(mouse_id, moveX, moveY);
            lines[mouse_id].x = ret.x;
            lines[mouse_id].y = ret.y;

            is_move = true;
            mouse_id++;

            event.preventDefault();
        },

        mouse_end_move: function(event) {
            is_move = false;
            self.save(event);
            event.preventDefault();
        },

        mouse_move: function(event) {
            if (is_move) {
                lines[mouse_id] = {
                    x : event.pageX - offset.left + document.getElementById('img-frame-outer').scrollLeft,
                    y : event.pageY - offset.top + document.getElementById('img-frame-outer').scrollTop
                };

                var moveX = event.pageX - offset.left - lines[mouse_id].x + document.getElementById('img-frame-outer').scrollLeft,
                    moveY = event.pageY - offset.top - lines[mouse_id].y + document.getElementById('img-frame-outer').scrollTop;

                var ret = self.draw(mouse_id, moveX, moveY);

                lines[mouse_id].x = ret.x;
                lines[mouse_id].y = ret.y;

                mouse_id++;
            }

            event.preventDefault();
        },
        is_modified: function() {
            return modified;
        },
        reset_markup: function() {
            self.size_canvas();

            ctxt.setTransform(1, 0, 0, 1, 0, 0);
            ctxt.clearRect(0, 0, canvas.width, canvas.height);

            canvas_val = '';
            modified = false;
        },
        set_marker_width: function(size) {
            if (!isNaN(parseFloat(size)) && isFinite(size)) {
                marker_width = size;
            }
        },
        set_color_value: function(hex_value) {
            // valid hex value, must start with #
            if(/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(hex_value)) {
                color_value = hex_value;
            }
        }
    };

    self.init();
    return self;
};