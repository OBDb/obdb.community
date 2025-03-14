// src/components/VehicleCard.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMakeSvgUrl, getModelSvgUrl } from '../utils/vehicleSymbolMap';
import ModelYearBadge from './ModelYearBadge';

const VehicleCard = ({
  make,
  model,
  modelYears = [],
  totalPids = null,
  isSelected = false,
  onSelect = null,
  showYearBadges = true
}) => {
  const navigate = useNavigate();

  // Generate image URLs for make and model
  const makeImageUrl = getMakeSvgUrl(make);
  const modelImageUrl = getModelSvgUrl(make, model);

  // State to track if images loaded successfully
  const [makeImageLoaded, setMakeImageLoaded] = useState(true);
  const [modelImageLoaded, setModelImageLoaded] = useState(true);

  // Get unique model years
  const uniqueYears = modelYears && modelYears.length > 0
    ? [...new Set(modelYears.flat())].sort((a, b) => a - b)
    : [];

  // Group consecutive years into ranges
  const yearRanges = [];
  if (uniqueYears.length > 0) {
    let startYear = uniqueYears[0];
    let endYear = startYear;

    for (let i = 1; i < uniqueYears.length; i++) {
      if (uniqueYears[i] === endYear + 1) {
        endYear = uniqueYears[i];
      } else {
        yearRanges.push([startYear, endYear]);
        startYear = uniqueYears[i];
        endYear = startYear;
      }
    }

    yearRanges.push([startYear, endYear]);
  }

  const handleCardClick = () => {
    navigate(`/vehicles/${make}/${model}`);
  };

  const handleSelectClick = (e) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(make, model);
    }
  };

  return (
    <div
      className={`bg-white border rounded-md p-3 transition-colors cursor-pointer ${
        isSelected
          ? 'border-primary-500 bg-primary-50'
          : 'border-gray-200 hover:bg-gray-50 hover:border-primary-300'
      }`}
      onClick={handleCardClick}
    >
      <div className="flex flex-col">
        {/* Make logo */}
        <div className="flex items-center justify-center mb-2 h-8">
          {makeImageLoaded ? (
            <img
              src={makeImageUrl}
              alt={make}
              className="h-6 object-contain"
              onError={() => setMakeImageLoaded(false)}
            />
          ) : (
            <span className="text-xs font-medium text-gray-700">{make}</span>
          )}
        </div>

        {/* Vehicle model image */}
        <div className="flex items-center justify-center mb-2 h-24">
          {modelImageLoaded ? (
            <img
              src={modelImageUrl}
              alt={`${make} ${model}`}
              className="max-h-24 max-w-full object-contain"
              onError={() => setModelImageLoaded(false)}
            />
          ) : (
            <div className="flex items-center">
              <svg className="h-4 w-4 text-primary-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-1h3.05a2.5 2.5 0 014.9 0H19a1 1 0 001-1v-2a4 4 0 00-4-4h-3V4a1 1 0 00-1-1H3z" />
              </svg>
              <span className="text-sm font-medium">{model}</span>
            </div>
          )}
        </div>

        {/* Model year badges */}
        {showYearBadges && yearRanges.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {yearRanges.map((yearRange, index) => (
              <ModelYearBadge
                key={index}
                years={yearRange}
                variant={yearRange[0] >= 2015 ? 'primary' : 'default'}
              />
            ))}
          </div>
        )}

        {/* PID count badge if available */}
        {totalPids !== null && (
          <div className="flex justify-center mb-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {totalPids} PIDs
            </span>
          </div>
        )}

        <div className="flex items-center justify-between mt-auto">
          <span className="text-sm font-medium">{model}</span>

          {onSelect && (
            <button
              type="button"
              onClick={handleSelectClick}
              className={`h-5 w-5 rounded-full border flex items-center justify-center focus:outline-none ${
                isSelected
                  ? 'bg-primary-500 border-primary-500 text-white'
                  : 'border-gray-300 text-transparent hover:border-primary-500'
              }`}
            >
              {isSelected && (
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;
