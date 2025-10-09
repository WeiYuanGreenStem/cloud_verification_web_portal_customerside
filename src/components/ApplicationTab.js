import React, { useMemo } from 'react';

const ApplicationTabs = ({
  apps = [],
  activeTab,
  setActiveTab,
  loading = false,
  expandedParent,
  setExpandedParent,
}) => {
  const handleParentClick = (appCode) => {
    const isAlreadyExpanded = expandedParent === appCode;
    setExpandedParent(isAlreadyExpanded ? null : appCode);
    setActiveTab(appCode);
  };

  // Group parent + children
  const groupedApps = useMemo(() => {
    const appMap = {};
    const parentApps = [];

    apps.forEach((app) => {
      appMap[app.applicationCode] = { ...app, children: [] };
    });

    Object.values(appMap).forEach((app) => {
      if (app.parentApplicationCode && appMap[app.parentApplicationCode]) {
        appMap[app.parentApplicationCode].children.push(app);
      } else {
        parentApps.push(app);
      }
    });

    return parentApps;
  }, [apps]);

  return (
    <div className="flex overflow-x-auto scrollbar-hide gap-2 pr-4 max-w-full">
      {/* All tab */}
      <button
        onClick={() => {
          setActiveTab('all');
          setExpandedParent(null); // close dropdowns
        }}
        className={`px-4 py-2 shrink-0 rounded-lg flex items-center gap-2 transition-colors ${
          activeTab === 'all'
            ? 'bg-gray-800 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        <span>📱</span> All Applications
      </button>

      {!loading &&
        groupedApps.map((app) => {
          const isExpanded = expandedParent === app.applicationCode;

          if (app.children.length > 0) {
            return (
              <div key={app.applicationCode} className="relative shrink-0">
                <button
                  onClick={() => handleParentClick(app.applicationCode)}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                    activeTab === app.applicationCode
                      ? 'bg-gray-800 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span>📦</span> {app.applicationName} ▾
                </button>

                {/* Show dropdown if expanded */}
                {isExpanded && (
                  <div className="absolute left-0 mt-1 z-10 bg-white border rounded shadow-md w-max min-w-[200px] flex flex-col">
                    {app.children.map((child) => (
                      <button
                        key={child.applicationCode}
                        onClick={() => {
                          setActiveTab(child.applicationCode);
                          setExpandedParent(app.applicationCode); // keep dropdown open
                        }}
                        className={`px-4 py-2 text-left hover:bg-gray-100 ${
                          activeTab === child.applicationCode ? 'bg-gray-200 font-semibold' : ''
                        }`}
                      >
                        {child.applicationName}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          } else {
            return (
              <button
                key={app.applicationCode}
                onClick={() => {
                  setActiveTab(app.applicationCode);
                  setExpandedParent(null);
                }}
                className={`px-4 py-2 shrink-0 rounded-lg flex items-center gap-2 transition-colors ${
                  activeTab === app.applicationCode
                    ? 'bg-gray-800 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>📦</span> {app.applicationName}
              </button>
            );
          }
        })}
    </div>
  );
};

export default ApplicationTabs;
