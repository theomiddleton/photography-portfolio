import { useState, useEffect } from 'react';
'use client'
import React from 'react'
import { useState } from 'react'
import { Icons } from '~/components/ui/icons'
import { Button } from '~/components/ui/button'

const Admin = () => {
  const [images, setImages] = useState([]);

  useEffect(() => {
    // Fetch images from the API
    fetch('/api/images')
      .then(response => response.json())
      .then(data => setImages(data))
      .catch(error => console.error('Failed to fetch images:', error));
  }, []);

  const handleDelete = (uuid) => {
    // Delete image using the delete API route
    fetch(`/api/images/${uuid}`, {
      method: 'DELETE',
    })
      .then(response => {
        if (response.ok) {
          // Remove the deleted image from the state
          setImages(prevImages => prevImages.filter(image => uuid !== uuid));
        } else {
          console.error('Failed to delete image:', response);
        }
      })
      .catch(error => console.error('Failed to delete image:', error));
  };

  return (
    <div className="min-h-screen bg-white text-black space-y-12">
      <div className="max-w-2xl mx-auto py-24 px-4">
        <h2 className="text-base font-semibold leading-7 text-black">
          Admin Panel
        </h2>
        <p className="mt-1 text-sm leading-6 text-gray-800">
          Upload the image
        </p>

        {/* Image upload code goes here */}

        <div className="mt-6">
          <h3 className="text-lg font-semibold leading-6 text-black">
            Images
          </h3>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {images.map(image => (
              <div key={image.id} className="flex flex-col items-center">
                <img src={image.url} alt={image.name} className="w-full h-48 object-cover" />
                <button onClick={() => handleDelete(image.id)} className="mt-2 px-4 py-2 text-sm font-medium leading-5 text-white bg-red-500 rounded-md hover:bg-red-600 focus:outline-none focus:bg-red-600">
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
      </div>