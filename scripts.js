$(document).ready(function () {
  $('.container-slider').slick({
    slidesToShow: 3,
    slidesToScroll: 1,
    dots: true,
    centerMode: true,    
    autoplay:true,
    autoplaySpeed:3000,    
    infinite:true,
    speed:2000,
    
    centerMode: true,
    centerPadding: '40px',
    
    pauseOnDotsHover: true,
    pauseOnFocus: true,
    pauseOnHover: true,
    
    
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          centerPadding: '20px',
        }
        },
        {
        breakpoint: 800,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          centerPadding: '20px',
        },
      }
    ]
  });
});