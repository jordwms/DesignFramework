$(document).ready(function(){  
  
    $('#filters button').click(function(e){  
  
        e.preventDefault();  
  
        var filter = $(this).attr('id');  
  
        $('#vert-cal > div').show();  

        $('#vert-cal > div:not(.' + filter + ')').hide();  
  
    });

    $(".project").sort(function(a,b){

        return new Date($(a).attr("data-date")) > new Date($(b).attr("data-date"));
    }).each(function(){
        $("#vert-cal").prepend(this);
    })
  
});