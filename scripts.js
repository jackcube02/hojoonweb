$(document).ready(function () {
  $('.container-slider').slick({
    infinite: false,
    slidesToShow: 3,
    slidesToScroll: 2,
    dots: true,
    centerMode: true,              // 가운데 정렬
    centerPadding: '40px',         // 좌우 간격 (원하는 값으로 조절 가능)
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          centerPadding: '20px'    // 모바일에서 여백 줄이기
        }
      }
    ]
  });
});
