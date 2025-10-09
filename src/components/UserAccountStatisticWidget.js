import React from 'react';

// Radial progress component
const CircularProgress = ({ percentage, color = 'gray' }) => {
  const radius = 28;
  const stroke = 4;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const colorMap = {
    red: '#ef4444',
    green: '#10b981',
    blue: '#3b82f6',
    yellow: '#facc15',
    gray: '#9ca3af'
  };

  return (
    <svg height={radius * 2} width={radius * 2} className="rotate-[-90deg]">
      <circle
        stroke="#e5e7eb"
        fill="transparent"
        strokeWidth={stroke}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <circle
        stroke={colorMap[color] || '#9ca3af'}
        fill="transparent"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${circumference} ${circumference}`}
        style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.5s ease' }}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <text
        x="50%"
        y="50%"
        dy=".3em"
        textAnchor="middle"
        className="fill-current text-sm font-bold"
        fill={colorMap[color]}
      >
        {percentage}%
      </text>
    </svg>
  );
};

const appStyles = {
  'APPS-2': { icon: '📦', color: 'green' },
  'APPS-1': { icon: '💼', color: 'yellow' },
  'APPS-3': { icon: '🛒', color: 'blue' },
  all: { icon: '📊', color: 'red' }
};

const UserStatsWidget = ({ usageStats = {}, appList = [] }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
      {/* All Applications */}
      {usageStats['All Applications'] && (
        <div className={`bg-red-50 rounded-xl shadow-sm p-4 lg:p-6 border border-red-500`}>
          <h3 className="text-gray-600 text-sm mb-4 flex items-center gap-2">
            {appStyles.all.icon} All Applications
          </h3>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20">
              <CircularProgress
                percentage={usageStats['All Applications'].percentage}
                color={appStyles.all.color}
              />
            </div>
            <div>
              <p className="text-2xl lg:text-3xl font-bold text-gray-800">
                {usageStats['All Applications'].active} / {usageStats['All Applications'].total}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Individual Application Cards */}
      {appList.map((app) => {
        const stat = usageStats[app.applicationName] || {
          active: 0,
          total: 0,
          percentage: 0,
        };

        const style = appStyles[app.applicationCode] || {
          icon: '🧩',
          color: 'gray',
        };

        return (
          <div
            key={app.applicationCode}
            className={`bg-${style.color}-50 rounded-xl shadow-sm p-4 lg:p-6 border border-${style.color}-500`}
          >
            <h3 className="text-gray-600 text-sm mb-4 flex items-center gap-2">
              {style.icon} {app.applicationName}
            </h3>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20">
                <CircularProgress percentage={stat.percentage} color={style.color} />
              </div>
              <div>
                <p className="text-2xl lg:text-3xl font-bold text-gray-800">
                  {stat.active} / {stat.total}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default UserStatsWidget;
