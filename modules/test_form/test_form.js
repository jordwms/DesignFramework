$(document).ready(function() {
    /* Init draw area*/
    var signature = new canvasDrawr({group:"signature", size: 10 });

    /*
     *  Activate form elements on focus
     */
    $("textarea,input,select,button,canvas").focus(function() {
        $(this).closest("div").addClass('active');
    });

    $("textarea,input,select,button,canvas").blur(function() {
        $(this).closest("div").removeClass('active');
    });

    /*
     *  Preceding sibling calls for flex-box effect
     */

});

$(document).ready(flex);
$(window).resize(flex);

function flex() {
    var width = $(window).width();
    $('span.input').css('width', '');
    $('span.action').css('width', '');

    if (width >= 0 && width < 480) {
        $('span.input').css('width', '96%');

        $('span.action').prevAll('span.input').css('width','82%');
    }
    else {
        if (width >= 480 && width < 800) {
            $('span.input').css('width', '97%');

            $('span.unit').prevAll('span.input').css('width','83%');

            $('span.action').prevAll('span.input').css('width','78%');

            $('span.input').next('span.action').css('width','13%');

            $('span.action').prev('span.input').css('width','87%');
        }
        else {
            if (width >= 800 && width < 1024) {
                $('span.input').css('width', '98%');

                $('span.unit').prev('span.input').css('width', '90%');

                $('span.info').prev('span.input').css('width', '50%');

                $('span.input').next('span.action').css('width','7%');

                $('span.action').prev('span.input').css('width', '93%');

                $('span.info').prev().prev('span.input').css('width', '50%')
            }
            else {
                if (width >= 1024) {
                    $('span.input').css('width', '98%');

                    $('span.unit').prev('span.input').css('width', '90%');

                    $('span.info').prev('span.input').css('width', '50%');

                    $('span.input').next('span.action').css('width','7%');

                    $('span.action').prev('span.input').css('width', '93%');

                    $('span.info').prev().prev('span.input').css('width', '50%')
                }
                else {
                    
                }
            }
        }
    }
};
