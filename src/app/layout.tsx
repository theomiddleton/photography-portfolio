// layout.tsx
import React from 'react';

const Layout: React.FC = ({ children }) => {
  return (
    <div>
      <header>
        <h1>Next app</h1>
      </header>
      <main>{children}</main>
      <footer>
        <p>Footer</p>
      </footer>
    </div>
  );
};

export default Layout;