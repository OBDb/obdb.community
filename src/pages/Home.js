// src/pages/Home.js
import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div>
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold mb-2">OBDb Explorer</h1>
        <p className="text-gray-600">
          Explore vehicle OBD parameters, commands, and vehicle-specific mappings
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center mb-4">
              <svg
                className="h-8 w-8 text-primary-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <h2 className="ml-3 text-lg font-medium text-gray-900">Browse Vehicles</h2>
            </div>
            <p className="text-gray-600 mb-4 text-sm">
              Explore all available vehicles and see which OBD parameters are mapped for each make and model.
            </p>
            <div className="mt-2">
              <Link
                to="/vehicles"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                View Vehicles
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center mb-4">
              <svg
                className="h-8 w-8 text-primary-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h2 className="ml-3 text-lg font-medium text-gray-900">Parameters Database</h2>
            </div>
            <p className="text-gray-600 mb-4 text-sm">
              Search and filter through all OBD parameters across all vehicles to find specific signals.
            </p>
            <div className="mt-2">
              <Link
                to="/parameters"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Explore Parameters
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center mb-4">
              <svg
                className="h-8 w-8 text-primary-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              <h2 className="ml-3 text-lg font-medium text-gray-900">OBD Commands</h2>
            </div>
            <p className="text-gray-600 mb-4 text-sm">
              View all available OBD commands and which vehicles support each command.
            </p>
            <div className="mt-2">
              <Link
                to="/commands"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                View Commands
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">About OBDb Explorer</h2>
        <div className="text-sm text-gray-600 space-y-2">
          <p>
            This tool is designed to make it easy to visualize and explore the complete set of OBD parameters
            that have been mapped for every vehicle in the OBDb GitHub organization.
          </p>
          <p>
            Each vehicle repository contains a signalset definition that follows the OBDb specification, and this
            explorer helps identify commonalities in these mappings across different vehicles.
          </p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Links</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/vehicles" className="text-primary-600 hover:text-primary-700 text-sm">
            Browse All Vehicles
          </Link>
          <Link to="/parameters" className="text-primary-600 hover:text-primary-700 text-sm">
            Parameter Database
          </Link>
          <Link to="/commands" className="text-primary-600 hover:text-primary-700 text-sm">
            OBD Commands
          </Link>
          <a href="https://github.com/OBDb" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 text-sm">
            OBDb GitHub
          </a>
        </div>
      </div>
    </div>
  );
};

export default Home;