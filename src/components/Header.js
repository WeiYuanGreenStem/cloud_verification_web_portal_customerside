import React from 'react';
import { Menu } from 'lucide-react';

const Header = ({ toggleSidebar, title, subtitle }) => {
  return (
    <div className="lg:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-30">
      <div>
        <h1 className="text-xl font-bold text-gray-800">{title}</h1>
        {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
      </div>
      <button
        onClick={toggleSidebar}
        className="p-2 rounded-md hover:bg-gray-100 transition-colors"
      >
        <Menu size={24} className="text-gray-600" />
      </button>
    </div>
  );
};

export default Header;