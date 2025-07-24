import { useState, useEffect } from 'react';
import { faker } from '@faker-js/faker';
import Image from 'next/image';

export default function Carousel() {
  const images = Array.from({ length: 5 }, () => faker.image.urlPicsumPhotos());
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const imageInterval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);

    return () => clearInterval(imageInterval);
  }, [images.length]);

  return (
    <div className="relative z-20 flex flex-1 flex-col justify-center">
      <div className="relative h-64 w-full overflow-hidden rounded-lg shadow-lg">
        {images.map((image, index) => (
          <Image
            key={index}
            src={image}
            alt={`Carousel ${index}`}
            width={500}
            height={300}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
