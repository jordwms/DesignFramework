$(document).ready(function() {
    /* Init draw area*/
    $(function(){
      var draw_area = new CanvasDrawr({id:"example", size: 10 });
    });

    /*
     *  Activate form elements on focus
     */
    $("textarea,input,select,button,canvas").focus(function() {
        $(this).closest("tr").addClass('active');
    });

    $("textarea,input,select,button,canvas").blur(function() {
        $(this).closest("tr").removeClass('active');
    });

    $("tr").click(function() {
        $(this).find("input,textarea,select,button,canvas").focus().select();
        return(false);
    });
});
