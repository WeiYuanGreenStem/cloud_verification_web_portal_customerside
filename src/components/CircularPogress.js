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
        stroke="#e5e7eb" // light gray bg
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

export default CircularProgress;