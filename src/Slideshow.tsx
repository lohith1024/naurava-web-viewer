import React, { useState, useEffect } from 'react';
import './Slideshow.css';

// Define image URLs
const images = [
  '/src/public/sample1.png',
  '/src/public/sample2.png',
  '/src/public/sample3.jpg',
  '/src/public/sample4.jpg',
  '/src/public/sample5.png',
  '/src/public/sample6.png'
];

const Slideshow: React.FC = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  useEffect(() => {
    // Set up automatic slideshow
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000); // Change image every 5 seconds
    
    return () => clearInterval(interval); // Clean up on unmount
  }, []);
  
  // Manual navigation
  const goToNextSlide = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };
  
  const goToPrevSlide = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };
  
  return (
    <div className="slideshow-container">
      <div className="slideshow-image-container">
        {images.map((image, index) => (
          <div 
            key={index} 
            className={`slideshow-slide ${index === currentImageIndex ? 'active' : ''}`}
          >
            <img src={image} alt={`Slide ${index + 1}`} />
          </div>
        ))}
      </div>
      
      <div className="slideshow-controls">
        <button className="slideshow-control prev" onClick={goToPrevSlide}>
          &#10094;
        </button>
        <div className="slideshow-dots">
          {images.map((_, index) => (
            <span 
              key={index} 
              className={`slideshow-dot ${index === currentImageIndex ? 'active' : ''}`} 
              onClick={() => setCurrentImageIndex(index)}
            />
          ))}
        </div>
        <button className="slideshow-control next" onClick={goToNextSlide}>
          &#10095;
        </button>
      </div>
    </div>
  );
};

export default Slideshow; 