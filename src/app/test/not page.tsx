import React, { useEffect, useState } from 'react';
import { SiteHeader } from '~/components/site-header';

import { db } from '~/server/db';
import { imageData } from '~/server/db/schema';

const ImageGrid = () => {
  const [images, setImages] = useState([]);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const result = await db
          .select({
            fileUrl: imageData.fileUrl,
          })
          .from(imageData);
        console.log('image map', result);
        setImages(result);
      } catch (error) {
        console.error('Error fetching images:', error);
      }
    };

    fetchImages();
  }, []);

  return (
    <div>
      <SiteHeader />
      <div>
        {images.map((image, index) => (
          <img key={index} src={image.fileUrl} alt={`Image ${index}`} />
        ))}
      </div>
    </div>
  );
};

export default ImageGrid;
