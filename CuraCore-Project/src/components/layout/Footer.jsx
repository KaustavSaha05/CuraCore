import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-100 border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <div className="text-center text-sm text-gray-500">
          <p>&copy; {currentYear} CuraCore. All Rights Reserved.</p>
          <p className="mt-1">Developed by Black Clover</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;