$(document).ready(function () {
  $('.container-slider').slick({
    infinite: false,
    slidesToShow: 3,
    slidesToScroll: 2,
    dots: true,
    centerMode: true,              
    centerPadding: '40px',         
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          centerPadding: '20px'
        }
      }
    ]
  });
});

// import { v2 as cloudinary } from 'cloudinary';

// (async function() {

//     // Configuration
//     cloudinary.config({ 
//         cloud_name: 'dcyuf1hqs', 
//         api_key: '642594957495464', 
//         api_secret: 'i6kk7MolaCwpkdrEJGWX-23kF5U' // Click 'View API Keys' above to copy your API secret
//     });
    
//     // Upload an image
//      const uploadResult = await cloudinary.uploader
//        .upload(
//            'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg', {
//                public_id: 'shoes',
//            }
//        )
//        .catch((error) => {
//            console.log(error);
//        });
    
//     console.log(uploadResult);
    
//     // Optimize delivery by resizing and applying auto-format and auto-quality
//     const optimizeUrl = cloudinary.url('shoes', {
//         fetch_format: 'auto',
//         quality: 'auto'
//     });
    
//     console.log(optimizeUrl);
    
//     // Transform the image: auto-crop to square aspect_ratio
//     const autoCropUrl = cloudinary.url('shoes', {
//         crop: 'auto',
//         gravity: 'auto',
//         width: 500,
//         height: 500,
//     });
    
//     console.log(autoCropUrl);    
// })();
