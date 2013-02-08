$(document).ready(function() {
    /* Init draw area*/
    var signature = new canvasDrawr({id:"signature", size: 10 });

    /*
     *  Activate form elements on focus
     */
    $("textarea,input,select,button,canvas").focus(function() {
        $(this).closest("div").addClass('active');
    });

    $("textarea,input,select,button,canvas").blur(function() {
        $(this).closest("div").removeClass('active');
    });

});