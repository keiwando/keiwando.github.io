$(document).ready(function(){

  function setupCarousel(){
    var $item = $('.carousel .item'); 
    var $wHeight = $(window).height();
    $item.eq(0).addClass('active');
    $item.height($wHeight); 
    $item.addClass('full-screen');

    $('.carousel img').each(function() {
      var $src = $(this).attr('src');
      var $color = $(this).attr('data-color');
      $(this).parent().css({
        'background-image' : 'url(' + $src + ')',
        'background-color' : $color
      });
      $(this).remove();
    });

    $('.carousel').carousel({
      interval: 6000,
      pause: "false"
    });
  }

  
  $("#theCarousel").swiperight(function() {  
    $(this).carousel('prev');  
  });

  $("#theCarousel").swipeleft(function() {  
    $(this).carousel('next');  
  });  

  $(window).on('resize', function (){
    var wHeight = $(window).height();
    $('.carousel .item').height(wHeight);
  });

  function setupMasthead(){
    if($(window).width() <= 640 || $(window).height() <= 640){
      activateScrollMasthead();
    }
  }

  function activateScrollMasthead(){
    $('.masthead').addClass('scroll-masthead');
    $('#K').addClass("hidden");
    $('#K_blk').removeClass("hidden");
    $('.menu-button').addClass("scrolling");
  }

  function deactivateScrollMasthead(){
    $('.masthead').removeClass('scroll-masthead');
    $('#K').removeClass("hidden");
    $('#K_blk').addClass("hidden");
    $('.menu-button').removeClass("scrolling");
  }


  $('.sandwich-button').click(function(){
    if($(this).hasClass('selected')){
      $(this).removeClass('selected');
      $('#menu').removeClass('activated');

      //check if Scroll masthead should be activated
      var top = Math.round($(window).scrollTop());
      var offset = 20;
      if(top >= offset){
        activateScrollMasthead();  
      }
    }else{
      //menu activated
      $(this).addClass('selected');
      $('#menu').addClass('activated');
      if($(window).width() > 640 && $(window).height() > 640){
        deactivateScrollMasthead();
      }
    }
  });


  if (!$('.masthead').hasClass('fixed-position')) {
    
    $(window).scroll(function(){

      if($(window).width() > 640 && $(window).height() > 640){
        // we round here to reduce a little workload
        var top = Math.round($(window).scrollTop());
        var offset = 20;
        var opacity = "" + 100/(Math.abs(top - $('carousel').height()));
        var text = $('.item').find('.carousel-caption');
        //console.log("top: " + top + " opacity " + opacity);

        var textPosition = (Math.abs(top)/6).toFixed(0);
        //text.css('transform','translateY(' + textPosition + "px)");
        text.css({ 'transform': 'translate3d(' + 0 +'px, -' +  textPosition*2 + 'px, 0)'});
        
        $('.carousel').css({ 'transform': 'translate3d(' + 0 +'px, -' +  textPosition + 'px, 0)'});  

        var text = $('.item').find('.carousel-caption');
        text.css('opacity',opacity);
        

        if (top >= offset) {

          if (!$('.masthead').hasClass('scroll-masthead')) {
            activateScrollMasthead();
          }
            
        } else {

          if ($('.masthead').hasClass('scroll-masthead')) {
            deactivateScrollMasthead();
          }
        }
      }    

    });
  }
  
  if($('.carousel').length > 0){
    setupCarousel();  
  }
  setupMasthead();


});