'use client'
import React, { useState } from 'react';

const AboutPage = () => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    const response = await fetch('/api/about', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
        body: JSON.stringify({ content: inputValue }),
    });

    const data = await response.json();
    console.log(data);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>
          Content:
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
        </label>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default AboutPage;