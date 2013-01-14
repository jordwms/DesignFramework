           // canvasDrawr originally from Mike Taylr  http://miketaylr.com/
           // Tim Branyen massaged it: http://timbranyen.com/
           // and i did too. with multi touch.
           // and boris fixed some touch identifier stuff to be more specific.
           
var CanvasDrawr = function(options) {
    // grab canvas element
    var canvas = document.getElementById(options.id),
        ctxt = canvas.getContext("2d");
        
    // These 3 lines keep the canvas from 'zooming', which ensures the line follows exactly where the points indicate
    canvas.style.width = '100%';
    canvas.width = canvas.offsetWidth;
    canvas.style.width = '';

    // set props from options, but the defaults are for the cool kids
    ctxt.lineWidth = options.size;
    ctxt.lineCap = options.lineCap || "round";
    ctxt.pX = undefined;
    ctxt.pY = undefined;

    var is_move = false; // Tracks whether or not the user is click-and-dragging
    var mouse_id = 0; // This is the only way to keep track of mouse actions
    var lines = [];
    var offset = $(canvas).offset();
    
    var self = {
        //bind click events
        init: function() {
            //set pX and pY from first click
            
            canvas.addEventListener('touchstart', self.preMove, false);
            canvas.addEventListener('touchmove', self.move, false);

            canvas.addEventListener('mousedown', self.mouse_startMove, false);
            canvas.addEventListener('mousemove', self.mouse_move, false);
            window.addEventListener('mouseup',   self.mouse_endMove, false); // window so the line won't draw when mouse is off canvas
            
        },

        preMove: function(event) {

            $.each(event.touches, function(i, touch) { // Each time the canvas is touched...
              
                var id      = touch.identifier; // Give the touch event an identifier
              
                lines[id] = { x     : this.pageX - offset.left, // Determine it's position on the canvas
                              y     : this.pageY - offset.top
                            };
            });

            event.preventDefault();
        },

        move: function(event) {

            $.each(event.touches, function(i, touch) {
                var id = touch.identifier,
                    moveX = this.pageX - offset.left - lines[id].x, // Dynamically find the position of X,Y
                    moveY = this.pageY - offset.top - lines[id].y;

                var ret = self.draw(id, moveX, moveY);
                lines[id].x = ret.x;
                lines[id].y = ret.y;
            });

            event.preventDefault();
        },

        draw: function(i, changeX, changeY) {
            ctxt.strokeStyle = "black";
            ctxt.beginPath();
            if(is_move){
                ctxt.moveTo(lines[i-1].x, lines[i-1].y);
            } else {
                ctxt.moveTo(lines[i].x, lines[i].y);
            }
            

            ctxt.lineTo(lines[i].x + changeX, lines[i].y + changeY);
            ctxt.stroke();
            ctxt.closePath();

            return { x: lines[i].x + changeX, y: lines[i].y + changeY };
        },

        mouse_startMove: function(event) {

            lines[mouse_id] = {
                x     : event.pageX - offset.left, // Position on the canvas found as coords on the page minus the offset of the canvas
                y     : event.pageY - offset.top
            };
            is_move = true;
            mouse_id++;
            event.preventDefault();
        },

        mouse_endMove: function(event) {
            is_move = false;
            event.preventDefault();
        },

        mouse_move: function(event) {

            if (is_move) {
                lines[mouse_id] = {
                            x     : event.pageX - offset.left,
                            y     : event.pageY - offset.top
                };

                var moveX = event.pageX - offset.left - lines[mouse_id].x,
                    moveY = event.pageY - offset.top - lines[mouse_id].y;
              
                var ret = self.draw(mouse_id, moveX, moveY);
                lines[mouse_id].x = ret.x;
                lines[mouse_id].y = ret.y;
                mouse_id++;
            }
            
            event.preventDefault();
        }
    };

    return self.init();
};
