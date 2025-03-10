// src/components/Navbar.js
import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigation = [
    { name: 'Home', path: '/' },
    { name: 'Vehicles', path: '/vehicles' },
    { name: 'Parameters', path: '/parameters' },
    { name: 'Commands', path: '/commands' },
  ];

  return (
    <nav className="bg-primary-600 shadow-md">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-white font-bold text-xl">
                OBDb Explorer
              </Link>
            </div>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
            {navigation.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  isActive
                    ? 'px-3 py-2 text-sm font-medium text-white bg-primary-700 rounded-md'
                    : 'px-3 py-2 text-sm font-medium text-primary-100 hover:text-white hover:bg-primary-500 rounded-md'
                }
              >
                {item.name}
              </NavLink>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-primary-200 hover:text-white hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded="false"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {/* Icon when menu is closed */}
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              {/* Icon when menu is open */}
              <svg
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden bg-primary-700`}
        id="mobile-menu"
      >
        <div className="px-2 pt-2 pb-3 space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                isActive
                  ? 'block px-3 py-2 text-base font-medium text-white bg-primary-800 rounded-md'
                  : 'block px-3 py-2 text-base font-medium text-primary-200 hover:text-white hover:bg-primary-500 rounded-md'
              }
              onClick={() => setIsMenuOpen(false)}
            >
              {item.name}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
