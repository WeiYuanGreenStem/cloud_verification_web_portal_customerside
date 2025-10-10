class ActivityGenerator {
  constructor() {
    this.activityTypes = {
      DEVICE_LICENSE_KEY: 'device_license_key',
      USER_ACCOUNT: 'user_account',
      AUTHENTICATION: 'authentication',
      PROFILE: 'profile',
      SYSTEM: 'system'
    };

    this.activityActions = {
      // Device License Key Actions
      REQUEST_CREATED: 'request_created',
      REQUEST_APPROVED: 'request_approved',
      REQUEST_DENIED: 'request_denied',
      KEY_ACTIVATED: 'key_activated',
      KEY_DEACTIVATED: 'key_deactivated',
      KEY_RENEWED: 'key_renewed',
      KEY_EXPIRED: 'key_expired',
      
      // User Account Actions
      USER_CREATED: 'user_created',
      USER_ACTIVATED: 'user_activated',
      USER_DEACTIVATED: 'user_deactivated',
      USER_LOGIN: 'user_login',
      USER_LOGOUT: 'user_logout',
      
      // Profile Actions
      PROFILE_UPDATED: 'profile_updated',
      PASSWORD_CHANGED: 'password_changed',
      
      // System Actions
      DATA_REFRESH: 'data_refresh',
      SYSTEM_ACCESS: 'system_access'
    };
  }

  // Generate activities from device license key data
  generateDeviceLicenseKeyActivities(deviceKeys = []) {
    const activities = [];
    const now = new Date();

    deviceKeys.forEach((device, index) => {
      // Simulate realistic timestamps (last 30 days)
      const timestamp = new Date(now - Math.random() * 30 * 24 * 60 * 60 * 1000);
      
      const baseActivity = {
        id: `device_${device.deviceLicenseKeyCode || index}_${timestamp.getTime()}`,
        type: this.activityTypes.DEVICE_LICENSE_KEY,
        timestamp: timestamp,
        deviceInfo: {
          deviceCode: device.deviceLicenseKeyCode,
          deviceName: device.deviceName,
          applicationName: device.applicationName,
          customerName: device.customerName
        }
      };

      // Generate activity based on device status
      const status = (device.statusName || '').toLowerCase();
      
      switch (status) {
        case 'pending':
          activities.push({
            ...baseActivity,
            action: this.activityActions.REQUEST_CREATED,
            message: `New device license key request created`,
            details: `Device "${device.deviceName}" requested access to ${device.applicationName}`,
            status: 'Pending',
            color: 'bg-orange-500',
            priority: 'high'
          });
          break;

        case 'active':
          // Randomly decide if this was recently approved or activated
          const isRecentApproval = Math.random() > 0.5;
          if (isRecentApproval) {
            activities.push({
              ...baseActivity,
              action: this.activityActions.REQUEST_APPROVED,
              message: `Device license key request approved`,
              details: `Device "${device.deviceName}" has been approved for ${device.applicationName}`,
              status: 'Approved',
              color: 'bg-green-500',
              priority: 'medium'
            });
          } else {
            activities.push({
              ...baseActivity,
              action: this.activityActions.KEY_ACTIVATED,
              message: `Device license key activated`,
              details: `Device "${device.deviceName}" is now active on ${device.applicationName}`,
              status: 'Active',
              color: 'bg-green-500',
              priority: 'low'
            });
          }
          break;

        case 'inactive':
        case 'denied':
          if (status === 'denied') {
            activities.push({
              ...baseActivity,
              action: this.activityActions.REQUEST_DENIED,
              message: `Device license key request denied`,
              details: `Device "${device.deviceName}" request was denied for ${device.applicationName}`,
              status: 'Denied',
              color: 'bg-red-500',
              priority: 'medium'
            });
          } else {
            activities.push({
              ...baseActivity,
              action: this.activityActions.KEY_DEACTIVATED,
              message: `Device license key deactivated`,
              details: `Device "${device.deviceName}" has been deactivated from ${device.applicationName}`,
              status: 'Inactive',
              color: 'bg-gray-500',
              priority: 'low'
            });
          }
          break;

        case 'expired':
          activities.push({
            ...baseActivity,
            action: this.activityActions.KEY_EXPIRED,
            message: `Device license key expired`,
            details: `Device "${device.deviceName}" license has expired for ${device.applicationName}`,
            status: 'Expired',
            color: 'bg-red-400',
            priority: 'medium'
          });
          break;

        default:
          // Generate a generic system activity
          activities.push({
            ...baseActivity,
            action: this.activityActions.SYSTEM_ACCESS,
            message: `Device license key status updated`,
            details: `Device "${device.deviceName}" status changed to ${device.statusName}`,
            status: device.statusName || 'Unknown',
            color: 'bg-blue-500',
            priority: 'low'
          });
      }
    });

    return activities;
  }

  // Generate activities from user statistics data
  generateUserAccountActivities(userStats = null) {
    const activities = [];
    const now = new Date();

    if (!userStats || !userStats.applications) {
      return activities;
    }

    userStats.applications.forEach((app, index) => {
      // Generate activities for each application
      const timestamp = new Date(now - Math.random() * 7 * 24 * 60 * 60 * 1000); // Last week
      
      const baseActivity = {
        id: `user_${app.name}_${index}_${timestamp.getTime()}`,
        type: this.activityTypes.USER_ACCOUNT,
        timestamp: timestamp,
        applicationInfo: {
          applicationName: app.name,
          activeUsers: app.active,
          totalUsers: app.total,
          activityRate: app.percentage
        }
      };

      // Generate different types of user activities
      const activityVariants = [
        {
          action: this.activityActions.USER_LOGIN,
          message: `User activity detected in ${app.name}`,
          details: `${app.active} users are currently active (${app.percentage}% activity rate)`,
          status: 'Active',
          color: 'bg-purple-500',
          priority: 'low'
        },
        {
          action: this.activityActions.USER_ACTIVATED,
          message: `New users activated in ${app.name}`,
          details: `${app.active} out of ${app.total} users are now active`,
          status: 'Activated',
          color: 'bg-green-500',
          priority: 'medium'
        }
      ];

      // Randomly select an activity variant
      const selectedVariant = activityVariants[Math.floor(Math.random() * activityVariants.length)];
      
      activities.push({
        ...baseActivity,
        ...selectedVariant
      });
    });

    return activities;
  }

  // Generate system activities
  generateSystemActivities() {
    const activities = [];
    const now = new Date();

    // Dashboard refresh activity
    activities.push({
      id: `system_refresh_${now.getTime()}`,
      type: this.activityTypes.SYSTEM,
      action: this.activityActions.DATA_REFRESH,
      timestamp: now,
      message: 'Dashboard data refreshed',
      details: 'System statistics and user data have been updated',
      status: 'Completed',
      color: 'bg-blue-500',
      priority: 'low'
    });

    // System access activity (simulated)
    const accessTimestamp = new Date(now - Math.random() * 2 * 60 * 60 * 1000); // Last 2 hours
    activities.push({
      id: `system_access_${accessTimestamp.getTime()}`,
      type: this.activityTypes.SYSTEM,
      action: this.activityActions.SYSTEM_ACCESS,
      timestamp: accessTimestamp,
      message: 'System portal accessed',
      details: 'Customer portal session initiated successfully',
      status: 'Active',
      color: 'bg-indigo-500',
      priority: 'low'
    });

    return activities;
  }

  // Generate profile-related activities
  generateProfileActivities() {
    const activities = [];
    const now = new Date();

    // Profile view activity (simulated)
    const profileTimestamp = new Date(now - Math.random() * 24 * 60 * 60 * 1000); // Last 24 hours
    activities.push({
      id: `profile_view_${profileTimestamp.getTime()}`,
      type: this.activityTypes.PROFILE,
      action: this.activityActions.SYSTEM_ACCESS,
      timestamp: profileTimestamp,
      message: 'Profile information accessed',
      details: 'Customer profile and settings were viewed',
      status: 'Viewed',
      color: 'bg-teal-500',
      priority: 'low'
    });

    return activities;
  }

  // Main method to generate comprehensive activities
  generateActivitiesFromData(deviceKeys = [], userStats = null, options = {}) {
    const {
      maxActivities = 20,
      includePending = true,
      includeSystemActivities = true,
      timeRange = 30 // days
    } = options;

    let allActivities = [];

    // Generate activities from different data sources
    const deviceActivities = this.generateDeviceLicenseKeyActivities(deviceKeys);
    const userActivities = this.generateUserAccountActivities(userStats);
    const systemActivities = includeSystemActivities ? this.generateSystemActivities() : [];
    const profileActivities = this.generateProfileActivities();

    // Combine all activities
    allActivities = [
      ...deviceActivities,
      ...userActivities,
      ...systemActivities,
      ...profileActivities
    ];

    // Filter activities based on time range
    const cutoffDate = new Date(Date.now() - timeRange * 24 * 60 * 60 * 1000);
    allActivities = allActivities.filter(activity => activity.timestamp >= cutoffDate);

    // Filter pending activities if needed
    if (!includePending) {
      allActivities = allActivities.filter(activity => 
        activity.status?.toLowerCase() !== 'pending'
      );
    }

    // Sort by timestamp (most recent first)
    allActivities.sort((a, b) => b.timestamp - a.timestamp);

    // Limit the number of activities
    allActivities = allActivities.slice(0, maxActivities);

    // Add unique IDs to ensure React key uniqueness
    allActivities = allActivities.map((activity, index) => ({
      ...activity,
      id: activity.id || `activity_${index}_${activity.timestamp.getTime()}`,
      index
    }));

    return allActivities;
  }

  // Log real-time activity (for immediate actions)
  logRealTimeActivity(activityData) {
    const {
      type,
      action,
      message,
      details,
      status = 'Completed',
      priority = 'medium',
      additionalData = {}
    } = activityData;

    const activity = {
      id: `realtime_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: type || this.activityTypes.SYSTEM,
      action: action || this.activityActions.SYSTEM_ACCESS,
      timestamp: new Date(),
      message,
      details,
      status,
      priority,
      color: this.getColorByType(type),
      isRealTime: true,
      ...additionalData
    };

    return activity;
  }

  // Get color based on activity type
  getColorByType(type) {
    const colorMap = {
      [this.activityTypes.DEVICE_LICENSE_KEY]: 'bg-blue-500',
      [this.activityTypes.USER_ACCOUNT]: 'bg-purple-500',
      [this.activityTypes.AUTHENTICATION]: 'bg-green-500',
      [this.activityTypes.PROFILE]: 'bg-teal-500',
      [this.activityTypes.SYSTEM]: 'bg-gray-500'
    };

    return colorMap[type] || 'bg-gray-500';
  }

  // Get priority score for sorting
  getPriorityScore(priority) {
    const priorityMap = {
      'high': 3,
      'medium': 2,
      'low': 1
    };

    return priorityMap[priority] || 1;
  }

  // Sort activities by priority and timestamp
  sortActivitiesByPriority(activities) {
    return activities.sort((a, b) => {
      const priorityDiff = this.getPriorityScore(b.priority) - this.getPriorityScore(a.priority);
      if (priorityDiff !== 0) return priorityDiff;
      
      return b.timestamp - a.timestamp;
    });
  }

  // Filter activities by type
  filterActivitiesByType(activities, types = []) {
    if (!types.length) return activities;
    
    return activities.filter(activity => types.includes(activity.type));
  }

  // Search activities by keyword
  searchActivities(activities, keyword = '') {
    if (!keyword.trim()) return activities;
    
    const searchTerm = keyword.toLowerCase();
    
    return activities.filter(activity => 
      activity.message.toLowerCase().includes(searchTerm) ||
      activity.details.toLowerCase().includes(searchTerm) ||
      activity.status.toLowerCase().includes(searchTerm) ||
      (activity.deviceInfo?.deviceName || '').toLowerCase().includes(searchTerm) ||
      (activity.deviceInfo?.applicationName || '').toLowerCase().includes(searchTerm) ||
      (activity.applicationInfo?.applicationName || '').toLowerCase().includes(searchTerm)
    );
  }
}

// Create and export a single instance
const activityGeneratorInstance = new ActivityGenerator();

// Export as named export to match the import in Home.js
export { activityGeneratorInstance as ActivityGenerator };

// Also export the class as default for potential direct instantiation
export default ActivityGenerator;