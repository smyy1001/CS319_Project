import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./Home.css";

function Home() {
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

return(
<div className="home-page-outer-container">
  <Slider {...sliderSettings}>
  
    <div>
    <div className="slider"> 
          <img className= "homeSliderPhotos" src="homePagePhoto1.jpg"/>
        </div>
    </div>
    <div>
        <div className="slider"> 
          <img className= "homeSliderPhotos" src="homePagePhoto2.jpg"/>
        </div>
    </div>
    <div>
        <div className="slider"> 
          <img className= "homeSliderPhotos" src="homePagePhoto3.jpg"/>
        </div>
    </div>
    <div>
        <div className="slider"> 
          <img className= "homeSliderPhotos" src="homePagePhoto5.png"/>
        </div>
    </div>
</Slider>
<div className="three-containers">
        <div className="small-container">
          <img src = "homePageLogo1.png"/>
        </div>
        <div className="small-container">Container 2</div>
        <div className="small-container">Container 3</div>
      </div> 
</div>)
}
export default Home;
