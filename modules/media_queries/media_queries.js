<script type="text/javascript">

    $(document).ready(function(){

      //this shows the current screen width in px;
      $('#current_screen_width').text( $(document).width() );

      //this updates the #current_screen_width when the window is resized
      $(window).bind('resize', function () {
        $('#current_screen_width').text( $(document).width() );
      });

    });

</script>