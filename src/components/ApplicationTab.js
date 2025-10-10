import React, { useMemo, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const ApplicationTabs = ({
  apps = [],
  activeTab,
  setActiveTab,
  loading = false,
  expandedParent,
  setExpandedParent,
}) => {
  const dropdownRef = useRef(null);

  // Get appropriate icon for application type
  const getAppIcon = (appName) => {
    const name = appName?.toLowerCase() || '';
    if (name.includes('warehouse')) return '🏠';
    if (name.includes('management')) return '💼';
    if (name.includes('salesman') || name.includes('sales')) return '👤';
    if (name.includes('stock') || name.includes('verification')) return '📦';
    if (name.includes('checking')) return '✅';
    if (name.includes('picking')) return '🎯';
    if (name.includes('admin')) return '⚙️';
    return '📱';
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setExpandedParent(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setExpandedParent]);

  const handleParentClick = (appCode) => {
    const isAlreadyExpanded = expandedParent === appCode;

    if (isAlreadyExpanded) {
      // If clicking on already expanded parent, collapse it and set as active
      setExpandedParent(null);
      setActiveTab(appCode);
    } else {
      // Expand the parent dropdown and set as active
      setExpandedParent(appCode);
      setActiveTab(appCode);
    }
  };

  const handleChildClick = (childCode, parentCode) => {
    setActiveTab(childCode);
    setExpandedParent(null); // ✅ Auto-close dropdown after selection
  };

  // Group applications by parent-child relationship
  const groupedApps = useMemo(() => {
    if (!apps || apps.length === 0) return [];

    const appMap = new Map();
    const parentApps = [];

    // First pass: create all apps map
    apps.forEach((app) => {
      appMap.set(app.applicationCode, {
        ...app,
        children: [],
      });
    });

    // Second pass: organize parent-child relationships
    apps.forEach((app) => {
      if (app.parentApplicationCode && appMap.has(app.parentApplicationCode)) {
        // This is a child app, add to parent's children
        appMap.get(app.parentApplicationCode).children.push(appMap.get(app.applicationCode));
      } else if (!app.parentApplicationCode) {
        // This is a parent app
        parentApps.push(appMap.get(app.applicationCode));
      }
    });

    // Add standalone apps (children without parents found)
    apps.forEach((app) => {
      if (app.parentApplicationCode && !appMap.has(app.parentApplicationCode)) {
        // Child app but parent not found, treat as standalone
        parentApps.push(appMap.get(app.applicationCode));
      }
    });

    return parentApps;
  }, [apps]);

  if (loading) {
    return (
      <div className="flex gap-2">
        <div className="animate-pulse bg-gray-200 h-10 w-32 rounded-lg"></div>
        <div className="animate-pulse bg-gray-200 h-10 w-40 rounded-lg"></div>
        <div className="animate-pulse bg-gray-200 h-10 w-36 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {/* All Applications Tab - No user count */}
      <button
        onClick={() => {
          setActiveTab('all');
          setExpandedParent(null);
        }}
        className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 whitespace-nowrap ${
          activeTab === 'all'
            ? 'bg-gray-800 text-white shadow-md'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        <span>📱</span>
        <span>All Applications</span>
      </button>

      {/* Dynamic Application Tabs - No user counts */}
      {groupedApps.map((app) => {
        const hasChildren = app.children && app.children.length > 0;
        const isExpanded = expandedParent === app.applicationCode;
        const isActive = activeTab === app.applicationCode;

        // Check if any child is active
        const hasActiveChild = hasChildren && app.children.some((child) => activeTab === child.applicationCode);

        if (hasChildren) {
          return (
            <div key={app.applicationCode} className="relative" ref={dropdownRef}>
              {/* Parent Application Button - No user count */}
              <button
                onClick={() => handleParentClick(app.applicationCode)}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 whitespace-nowrap ${
                  isActive || hasActiveChild
                    ? 'bg-gray-800 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{getAppIcon(app.applicationName)}</span>
                <span>{app.applicationName}</span>
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Dropdown for Child Applications - No user counts */}
              {isExpanded && (
                <div className="absolute top-full left-0 mt-1 z-20 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[220px] py-1">
                  {app.children.map((child) => (
                    <button
                      key={child.applicationCode}
                      onClick={() => handleChildClick(child.applicationCode, app.applicationCode)}
                      className={`w-full px-4 py-2 text-left flex items-center gap-2 transition-colors ${
                        activeTab === child.applicationCode
                          ? 'bg-gray-100 text-gray-900 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span>{getAppIcon(child.applicationName)}</span>
                      <span className="flex-1">{child.applicationName}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        } else {
          // Standalone application (no children) - No user count
          return (
            <button
              key={app.applicationCode}
              onClick={() => {
                setActiveTab(app.applicationCode);
                setExpandedParent(null);
              }}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 whitespace-nowrap ${
                activeTab === app.applicationCode
                  ? 'bg-gray-800 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>{getAppIcon(app.applicationName)}</span>
              <span>{app.applicationName}</span>
            </button>
          );
        }
      })}
    </div>
  );
};

export default ApplicationTabs;
