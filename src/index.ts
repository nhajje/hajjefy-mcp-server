#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { HajjefyApiClient } from './hajjefy-client.js';

// Load environment variables without dotenv to avoid output pollution
// dotenv can cause JSON parsing issues in Claude Desktop

// Validate required environment variables
const HAJJEFY_API_TOKEN = process.env.HAJJEFY_API_TOKEN;
const HAJJEFY_BASE_URL = process.env.HAJJEFY_BASE_URL || 'https://hajjefy.com';

if (!HAJJEFY_API_TOKEN) {
  console.error('Error: HAJJEFY_API_TOKEN environment variable is required');
  process.exit(1);
}

// Initialize the MCP server
const server = new Server(
  {
    name: 'hajjefy-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Initialize Hajjefy API client
const hajjefyClient = new HajjefyApiClient(HAJJEFY_BASE_URL, HAJJEFY_API_TOKEN);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'get_time_summary',
        description: 'Get time tracking summary for a specified period',
        inputSchema: {
          type: 'object',
          properties: {
            days: {
              type: 'number',
              description: 'Number of days to analyze (default: 30)',
              minimum: 1,
              maximum: 365,
            },
            from_date: {
              type: 'string',
              format: 'date',
              description: 'Start date (YYYY-MM-DD format)',
            },
            to_date: {
              type: 'string',
              format: 'date',
              description: 'End date (YYYY-MM-DD format)',
            },
          },
          additionalProperties: false,
        },
      },
      {
        name: 'get_user_analytics',
        description: 'Get detailed analytics for a specific user',
        inputSchema: {
          type: 'object',
          properties: {
            username: {
              type: 'string',
              description: 'Username to analyze',
            },
            days: {
              type: 'number',
              description: 'Number of days to analyze (default: 30)',
              minimum: 1,
              maximum: 365,
            },
          },
          required: ['username'],
          additionalProperties: false,
        },
      },
      {
        name: 'get_capacity_analysis',
        description: 'Get team capacity analysis showing utilization rates and workload distribution',
        inputSchema: {
          type: 'object',
          properties: {
            days: {
              type: 'number',
              description: 'Number of days to analyze (default: 30)',
              minimum: 1,
              maximum: 365,
            },
            user_filter: {
              type: 'string',
              description: 'Filter results for specific user (optional)',
            },
          },
          additionalProperties: false,
        },
      },
      {
        name: 'get_team_overview',
        description: 'Get team performance overview and rankings',
        inputSchema: {
          type: 'object',
          properties: {
            days: {
              type: 'number',
              description: 'Number of days to analyze (default: 30)',
              minimum: 1,
              maximum: 365,
            },
          },
          additionalProperties: false,
        },
      },
      {
        name: 'get_billable_analysis',
        description: 'Get billable hours analysis and revenue insights',
        inputSchema: {
          type: 'object',
          properties: {
            days: {
              type: 'number',
              description: 'Number of days to analyze (default: 30)',
              minimum: 1,
              maximum: 365,
            },
            from_date: {
              type: 'string',
              format: 'date',
              description: 'Start date (YYYY-MM-DD format)',
            },
            to_date: {
              type: 'string',
              format: 'date',
              description: 'End date (YYYY-MM-DD format)',
            },
          },
          additionalProperties: false,
        },
      },
      {
        name: 'export_data',
        description: 'Export time tracking data in various formats',
        inputSchema: {
          type: 'object',
          properties: {
            format: {
              type: 'string',
              enum: ['json', 'csv'],
              description: 'Export format (default: json)',
            },
            days: {
              type: 'number',
              description: 'Number of days to export (default: 30)',
              minimum: 1,
              maximum: 365,
            },
            include_details: {
              type: 'boolean',
              description: 'Include detailed worklog entries (default: false)',
            },
          },
          additionalProperties: false,
        },
      },
      {
        name: 'get_hajjefy_overview',
        description: 'Get an overview of Hajjefy capabilities and sample prompts to get started',
        inputSchema: {
          type: 'object',
          properties: {},
          additionalProperties: false,
        },
      },
      {
        name: 'get_daily_hours',
        description: 'Get comprehensive daily hours breakdown with project allocation, timestamps, trends, and billable analysis',
        inputSchema: {
          type: 'object',
          properties: {
            days: {
              type: 'number',
              description: 'Number of days to analyze (default: 30)',
              minimum: 1,
              maximum: 365,
            },
            from_date: {
              type: 'string',
              format: 'date',
              description: 'Start date (YYYY-MM-DD format)',
            },
            to_date: {
              type: 'string',
              format: 'date',
              description: 'End date (YYYY-MM-DD format)',
            },
            include_projects: {
              type: 'boolean',
              description: 'Include project/account allocation breakdown (default: true)',
            },
            include_worklogs: {
              type: 'boolean',
              description: 'Include specific worklog timestamps and details (default: false)',
            },
            include_trends: {
              type: 'boolean',
              description: 'Include weekly patterns and trends analysis (default: true)',
            },
            include_per_user: {
              type: 'boolean',
              description: 'Include daily hours breakdown per individual user (default: false)',
            },
          },
          additionalProperties: false,
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'get_time_summary':
        return await handleGetTimeSummary(args);
      case 'get_user_analytics':
        return await handleGetUserAnalytics(args);
      case 'get_capacity_analysis':
        return await handleGetCapacityAnalysis(args);
      case 'get_team_overview':
        return await handleGetTeamOverview(args);
      case 'get_billable_analysis':
        return await handleGetBillableAnalysis(args);
      case 'export_data':
        return await handleExportData(args);
      case 'get_daily_hours':
        return await handleGetDailyHours(args);
      case 'get_hajjefy_overview':
        return await handleGetHajjefyOverview(args);
      default:
        throw new McpError(ErrorCode.MethodNotFound, `Tool '${name}' not found`);
    }
  } catch (error) {
    console.error(`Error executing tool '${name}':`, error);
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to execute tool '${name}': ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
});

// Tool handler implementations
async function handleGetTimeSummary(args: any) {
  const { days = 30, from_date, to_date } = args;

  const overview = await hajjefyClient.getDashboardOverview(days, from_date, to_date);

  return {
    content: [
      {
        type: 'text',
        text: `# Time Tracking Summary (${overview.dateRange.from} to ${overview.dateRange.to})

## Overall Statistics
- **Total Hours**: ${overview.totals.hours} hours
- **Total Entries**: ${overview.totals.entries} worklogs
- **Active Days**: ${overview.totals.activeDays} days
- **Average Hours/Day**: ${overview.totals.avgHoursPerDay} hours

## Top Accounts
${overview.topAccounts.map((account, i) =>
  `${i + 1}. **${account.account}**: ${account.total_hours}h (${account.percentage}%)`
).join('\n')}

## Recent Activity (Last 7 Days)
${overview.recentDays.map(day =>
  `- **${day.date}**: ${day.total_hours}h (${day.entry_count} entries)`
).join('\n')}

## Database Status
- **Total Worklogs**: ${overview.database.totalWorklogs}
- **Date Range**: ${new Date(overview.database.dateRange.earliest).toLocaleDateString()} - ${new Date(overview.database.dateRange.latest).toLocaleDateString()}
- **Unique Users**: ${overview.database.uniqueAuthors}
- **Unique Accounts**: ${overview.database.uniqueAccounts}
`,
      },
    ],
  };
}

async function handleGetUserAnalytics(args: any) {
  const { username, days = 30 } = args;

  try {
    // Get user-specific analytics from Hajjefy API
    const userAnalytics = await hajjefyClient.getUserAnalytics(username, days);

    if (!userAnalytics.success) {
      return {
        content: [
          {
            type: 'text',
            text: `# User Analytics: ${username}

❌ **User not found or no data available**

This could mean:
- User name "${username}" doesn't exist in the system
- No time entries found for the past ${days} days
- User might be using a different name format

**Tip**: Try searching with partial names or check the user list first.`
          }
        ]
      };
    }

    // Calculate date range for filtering (last N days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    // Filter and calculate totals for the requested period
    let filteredTrends = userAnalytics.userProfile?.dailyBillableTrends || [];
    if (filteredTrends.length > 0) {
      filteredTrends = filteredTrends.filter((day: any) => {
        const dayDate = new Date(day.date).toISOString().split('T')[0];
        return dayDate >= startDateStr && dayDate <= endDateStr;
      });
    }

    // Calculate totals from filtered data
    const totalHours = filteredTrends.reduce((sum: number, day: any) => sum + (day.totalHours || 0), 0);
    const billableHours = filteredTrends.reduce((sum: number, day: any) => sum + (day.billableHours || 0), 0);
    const nonBillableHours = totalHours - billableHours;
    const totalEntries = filteredTrends.reduce((sum: number, day: any) => sum + (day.worklogCount || 0), 0);
    const activeDays = filteredTrends.filter((day: any) => day.totalHours > 0).length;
    const avgHoursPerDay = activeDays > 0 ? totalHours / activeDays : 0;

    return {
      content: [
        {
          type: 'text',
          text: `# 👤 User Analytics: ${username} (${startDateStr} to ${endDateStr})

## 📊 **Total Hours Summary (Last ${days} days)**
- **Total Hours Logged**: ${totalHours.toFixed(1)} hours
- **Billable Hours**: ${billableHours.toFixed(1)} hours (${totalHours > 0 ? ((billableHours / totalHours) * 100).toFixed(1) : '0'}%)
- **Non-Billable Hours**: ${nonBillableHours.toFixed(1)} hours (${totalHours > 0 ? ((nonBillableHours / totalHours) * 100).toFixed(1) : '0'}%)
- **Total Entries**: ${totalEntries} worklogs
- **Active Days**: ${activeDays} days
- **Average Hours/Day**: ${avgHoursPerDay.toFixed(1)} hours

## 🎯 **Performance Metrics**
- **Last Activity**: ${userAnalytics.userProfile?.lastActivity?.lastWorklogDate ? new Date(userAnalytics.userProfile.lastActivity.lastWorklogDate).toLocaleDateString() : 'N/A'}
- **Days Since Last Activity**: ${userAnalytics.userProfile?.lastActivity?.daysSinceLastActivity || 'N/A'} days
- **Total Worklogs (All Time)**: ${userAnalytics.userProfile?.lastActivity?.totalWorklogs || 'N/A'}

## 📈 **Recent Daily Activity (Last 7 days)**
${filteredTrends.slice(-7).map((day: any) => {
  const date = new Date(day.date).toLocaleDateString();
  const billablePercent = day.totalHours > 0 ? day.billablePercentage : 0;
  return `- **${date}**: ${day.totalHours.toFixed(1)}h total (${day.billableHours.toFixed(1)}h billable, ${billablePercent}%, ${day.worklogCount} entries)`;
}).join('\n') || 'No recent activity in the specified period'}

---
*Analysis period: ${days} days | Data retrieved: ${new Date().toISOString()}*`
        }
      ]
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `# User Analytics: ${username}

❌ **Error retrieving user data**

${error instanceof Error ? error.message : 'Unknown error occurred'}

**Suggestions**:
- Verify the username spelling: "${username}"
- Try using the exact name format from your time tracking system
- Check if the user has logged time in the past ${days} days`
        }
      ]
    };
  }
}

async function handleGetCapacityAnalysis(args: any) {
  const { days = 30, user_filter } = args;

  try {
    const capacityData = await hajjefyClient.getCapacityAnalysis(days);

    let users = capacityData.capacity.users;

    // Filter for specific user if requested
    if (user_filter) {
      users = users.filter((user: any) =>
        user.userName.toLowerCase().includes(user_filter.toLowerCase())
      );
    }

    // Sort users by utilization (highest first)
    users.sort((a: any, b: any) => b.avgUtilization - a.avgUtilization);

    return {
      content: [
        {
          type: 'text',
          text: `# Team Capacity Analysis (${days} days)

## 📊 Overall Team Summary
- **Total Users**: ${capacityData.capacity.summary.totalUsers}
- **Team Total Hours**: ${capacityData.capacity.summary.teamTotalActualHours}h
- **Expected Hours**: ${capacityData.capacity.summary.teamTotalExpectedHours}h
- **Average Utilization**: ${capacityData.capacity.summary.teamAvgUtilization}%
- **Capacity Gap**: ${capacityData.capacity.summary.capacityGap}h

## 🎯 Capacity Categories
- **Over-Capacity**: ${capacityData.capacity.summary.overCapacityUsers} users (>100% utilization)
- **Optimal Range**: ${capacityData.capacity.summary.optimalUsers} users (90-100% utilization)
- **Under-Utilized**: ${capacityData.capacity.summary.underUtilizedUsers} users (<90% utilization)

## 👥 Individual User Capacity ${user_filter ? `(Filtered: ${user_filter})` : ''}

${users.slice(0, user_filter ? users.length : 15).map((user: any, i: number) => {
  const status = user.avgUtilization > 100 ? '🔴 Over-Capacity' :
                 user.avgUtilization >= 90 ? '🟢 Optimal' :
                 '🟡 Under-Utilized';

  return `### ${i + 1}. ${user.userName} ${status}
- **Utilization**: ${user.avgUtilization}%
- **Actual Hours**: ${user.totalActualHours}h / ${user.totalExpectedHours}h expected
- **Over/Under**: ${user.overUnderTotal > 0 ? '+' : ''}${user.overUnderTotal}h
- **Time Off**: ${user.totalTimeOffDays} days (${user.totalTimeOffHours}h)
- **Workload**: ${user.workloadScheme.schemeName} (${user.workloadScheme.hoursPerDay}h/day)
- **Holiday Scheme**: ${user.holidayScheme.schemeName}
- **Days Worked**: ${user.totalDaysWorked} days, ${user.totalWorklogs} worklogs`;
}).join('\n\n')}

${users.length > 15 && !user_filter ? `\n*Showing top 15 users. Use user_filter parameter to see specific users.*` : ''}

## 💡 Recommendations
${capacityData.capacity.summary.overCapacityUsers > 0 ?
`- **Over-Capacity Users**: Consider redistributing workload or reviewing expectations for ${capacityData.capacity.summary.overCapacityUsers} users working >100%` : ''}
${capacityData.capacity.summary.underUtilizedUsers > 0 ?
`- **Under-Utilized Users**: ${capacityData.capacity.summary.underUtilizedUsers} users have capacity for additional work` : ''}
- **Team Gap**: ${capacityData.capacity.summary.capacityGap > 0 ?
  `Team is ${capacityData.capacity.summary.capacityGap}h over capacity` :
  `Team has ${Math.abs(capacityData.capacity.summary.capacityGap)}h unused capacity`}
`,
        },
      ],
    };
  } catch (error) {
    console.error('Error fetching capacity analysis:', error);

    // Fallback to basic overview
    const overview = await hajjefyClient.getDashboardOverview(days);
    return {
      content: [
        {
          type: 'text',
          text: `# Capacity Analysis (${days} days)

**Note**: Detailed capacity analysis not available. Showing basic overview.

## Team Overview
- **Total Hours**: ${overview.totals.hours} hours
- **Average Hours/Day**: ${overview.totals.avgHoursPerDay} hours
- **Active Users**: ${overview.database.uniqueAuthors}

For detailed capacity analysis with utilization rates, workload schemes, and holiday tracking, please visit your Hajjefy dashboard directly.
`,
        },
      ],
    };
  }
}

async function handleGetTeamOverview(args: any) {
  const { days = 30 } = args;

  const overview = await hajjefyClient.getDashboardOverview(days);

  return {
    content: [
      {
        type: 'text',
        text: `# Team Performance Overview (${days} days)

## Team Productivity
- **Total Team Hours**: ${overview.totals.hours} hours
- **Daily Average**: ${overview.totals.avgHoursPerDay} hours/day
- **Active Contributors**: ${overview.database.uniqueAuthors} users
- **Total Entries**: ${overview.totals.entries} worklogs

## Project Distribution
${overview.topAccounts.map((account, i) =>
  `${i + 1}. **${account.account}**: ${account.total_hours}h (${account.percentage}%)`
).join('\n')}

## Activity Trend (Last 7 Days)
${overview.recentDays.map(day =>
  `- **${day.date}**: ${day.total_hours}h (${day.entry_count} entries)`
).join('\n')}

## Key Insights
- Most active project: **${overview.topAccounts[0]?.account}** (${overview.topAccounts[0]?.percentage}% of time)
- Average entries per day: ${(parseInt(overview.totals.entries) / overview.totals.activeDays).toFixed(1)}
- Team spans ${overview.database.uniqueAccounts} different accounts/projects
`,
      },
    ],
  };
}

async function handleGetBillableAnalysis(args: any) {
  const { days = 30, from_date, to_date } = args;

  try {
    const billableData = await hajjefyClient.getBillableAnalysis(days, from_date, to_date);

    return {
      content: [
        {
          type: 'text',
          text: `# Billable Hours Analysis (${days} days)

## Revenue Summary
- **Total Billable Hours**: ${billableData.summary.billableHours} hours
- **Total Non-Billable Hours**: ${billableData.summary.nonBillableHours} hours
- **Billable Percentage**: ${billableData.summary.billablePercentage}%

## Top Billable Accounts
${billableData.topBillableAccounts?.map((account, i) =>
  `${i + 1}. **${account.account}**: ${account.billableHours}h`
).join('\n') || 'No billable accounts data available'}

## Monthly Trend
${billableData.monthlyTrend?.map(month =>
  `- **${month.month}**: ${month.billableHours}h billable (${month.billablePercentage}%)`
).join('\n') || 'Monthly trend data not available'}
`,
        },
      ],
    };
  } catch (error) {
    // Fallback to basic overview if billable analysis endpoint doesn't exist
    const overview = await hajjefyClient.getDashboardOverview(days, from_date, to_date);

    return {
      content: [
        {
          type: 'text',
          text: `# Billable Analysis (${days} days)

**Note**: Using basic time summary as billable analysis endpoint may not be available.

## Time Overview
- **Total Hours**: ${overview.totals.hours} hours
- **Total Entries**: ${overview.totals.entries} worklogs

## Account Breakdown
${overview.topAccounts.map((account, i) =>
  `${i + 1}. **${account.account}**: ${account.total_hours}h (${account.percentage}%)`
).join('\n')}

For detailed billable analysis, please check your Hajjefy dashboard directly.
`,
        },
      ],
    };
  }
}

async function handleExportData(args: any) {
  const { format = 'json', days = 30, include_details = false } = args;

  const overview = await hajjefyClient.getDashboardOverview(days);

  const exportData = {
    metadata: {
      exported_at: new Date().toISOString(),
      date_range: overview.dateRange,
      format,
      include_details,
    },
    summary: overview.totals,
    accounts: overview.topAccounts,
    recent_activity: overview.recentDays,
    database_info: overview.database,
  };

  if (format === 'csv') {
    // Convert to CSV format
    const csvData = [
      'Account,Hours,Percentage',
      ...overview.topAccounts.map(acc => `${acc.account},${acc.total_hours},${acc.percentage}%`)
    ].join('\n');

    return {
      content: [
        {
          type: 'text',
          text: `# Exported Data (CSV Format)

\`\`\`csv
${csvData}
\`\`\`

## Summary
- **Total Hours**: ${overview.totals.hours}
- **Export Date**: ${new Date().toISOString()}
- **Date Range**: ${overview.dateRange.from} to ${overview.dateRange.to}
`,
        },
      ],
    };
  } else {
    // JSON format
    return {
      content: [
        {
          type: 'text',
          text: `# Exported Data (JSON Format)

\`\`\`json
${JSON.stringify(exportData, null, 2)}
\`\`\`
`,
        },
      ],
    };
  }
}

async function handleGetDailyHours(args: any) {
  const {
    days = 30,
    from_date,
    to_date,
    include_projects = true,
    include_worklogs = false,
    include_trends = true,
    include_per_user = false
  } = args;

  try {
    // Fetch multiple data sources in parallel
    const [dailyData, accountsData, worklogsData] = await Promise.all([
      hajjefyClient.getDailyHours(days, from_date, to_date),
      include_projects ? hajjefyClient.getAccountsBreakdown(days, from_date, to_date) : null,
      (include_worklogs || include_per_user) ? hajjefyClient.getDetailedWorklogs(days, 1000) : null
    ]);

    if (!dailyData.success || !dailyData.daily) {
      return {
        content: [
          {
            type: 'text',
            text: 'No daily hours data available for the specified period.'
          }
        ]
      };
    }

    const daily = dailyData.daily;
    const summary = dailyData.summary;

    let report = `# 📊 Comprehensive Daily Hours Analysis (${dailyData.dateRange.from} to ${dailyData.dateRange.to})

## 📈 Summary Statistics
- **Total Days**: ${summary.totalDays}
- **Total Hours**: ${summary.totalHours.toFixed(1)} hours
- **Total Billable Hours**: ${summary.totalBillableHours.toFixed(1)} hours
- **Total Entries**: ${summary.totalEntries} worklogs
- **Average Daily Hours**: ${summary.avgDailyHours.toFixed(1)} hours
- **Average Utilization**: ${summary.avgUtilization.toFixed(1)}%

## 📅 Day-by-Day Breakdown
${daily.map((day: any) => {
      const date = new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      const billablePercent = day.total_hours > 0 ? ((day.billable_hours / day.total_hours) * 100).toFixed(1) : '0.0';
      return `- **${date}**: ${day.total_hours.toFixed(1)}h total | ${day.billable_hours.toFixed(1)}h billable (${billablePercent}%) | ${day.unique_users} users | ${day.entry_count} entries`;
    }).join('\n')}

## 🎯 Peak Activity Analysis
${(() => {
      const sortedByHours = [...daily].sort((a, b) => b.total_hours - a.total_hours);
      const peakDay = sortedByHours[0];
      const lowDay = sortedByHours[sortedByHours.length - 1];
      return `- **Highest Day**: ${new Date(peakDay.date).toLocaleDateString()} - ${peakDay.total_hours.toFixed(1)}h (${peakDay.unique_users} users)
- **Lowest Day**: ${new Date(lowDay.date).toLocaleDateString()} - ${lowDay.total_hours.toFixed(1)}h (${lowDay.unique_users} users)`;
    })()}

## 💰 Billable vs Non-Billable Hours
- **Total Billable**: ${summary.totalBillableHours.toFixed(1)}h (${((summary.totalBillableHours / summary.totalHours) * 100).toFixed(1)}%)
- **Total Non-Billable**: ${(summary.totalHours - summary.totalBillableHours).toFixed(1)}h (${(((summary.totalHours - summary.totalBillableHours) / summary.totalHours) * 100).toFixed(1)}%)`;

    // Add project/account allocation if requested
    if (include_projects && accountsData?.accounts) {
      const billableAccounts = accountsData.accounts.filter((acc: any) => acc.category === 'Billable' || acc.category === 'Centene');
      const internalAccounts = accountsData.accounts.filter((acc: any) => acc.category === 'Internal' || acc.category === 'Non-Billable');

      report += `\n\n## 🏢 Project/Account Allocation Breakdown

### 💼 Top Billable Projects
${billableAccounts.slice(0, 10).map((acc: any, i: number) =>
  `${i + 1}. **${acc.account}**: ${acc.hours.toFixed(1)}h (${acc.percentage}%) - ${acc.entries} entries`
).join('\n')}

### 🔧 Top Internal Projects
${internalAccounts.slice(0, 5).map((acc: any, i: number) =>
  `${i + 1}. **${acc.account}**: ${acc.hours.toFixed(1)}h (${acc.percentage}%) - ${acc.entries} entries`
).join('\n')}`;
    }

    // Add weekly trends analysis if requested
    if (include_trends && daily.length >= 7) {
      const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const weeklyPattern: any = {};

      daily.forEach((day: any) => {
        const dayOfWeek = new Date(day.date).getDay();
        const dayName = weekdays[dayOfWeek];
        if (!weeklyPattern[dayName]) {
          weeklyPattern[dayName] = { totalHours: 0, count: 0, billableHours: 0 };
        }
        weeklyPattern[dayName].totalHours += day.total_hours;
        weeklyPattern[dayName].billableHours += day.billable_hours;
        weeklyPattern[dayName].count += 1;
      });

      const sortedWeekdays = Object.entries(weeklyPattern)
        .map(([day, data]: [string, any]) => ({
          day,
          avgHours: data.totalHours / data.count,
          avgBillable: data.billableHours / data.count,
          count: data.count
        }))
        .sort((a, b) => b.avgHours - a.avgHours);

      report += `\n\n## 📊 Weekly Patterns & Trends

### 📈 Average Hours by Day of Week
${sortedWeekdays.map(({ day, avgHours, avgBillable, count }) =>
  `- **${day}**: ${avgHours.toFixed(1)}h avg (${avgBillable.toFixed(1)}h billable) - ${count} days analyzed`
).join('\n')}

### 🔍 Trend Insights
- **Most Productive Day**: ${sortedWeekdays[0].day} (${sortedWeekdays[0].avgHours.toFixed(1)}h average)
- **Least Productive Day**: ${sortedWeekdays[sortedWeekdays.length - 1].day} (${sortedWeekdays[sortedWeekdays.length - 1].avgHours.toFixed(1)}h average)`;
    }

    // Add specific worklog timestamps if requested
    if (include_worklogs && worklogsData?.worklogs) {
      const recentWorklogs = worklogsData.worklogs.slice(0, 20);
      report += `\n\n## ⏰ Recent Worklog Timestamps & Details

${recentWorklogs.map((log: any) => {
  const date = new Date(log.startDate).toLocaleDateString();
  const time = new Date(log.startDate).toLocaleTimeString();
  return `- **${date} ${time}** | ${log.authorDisplayName} | ${log.accountName} (${log.accountCategory}) | ${log.timeSpentHours}h | "${log.description?.substring(0, 60)}..."`;
}).join('\n')}

*Showing ${recentWorklogs.length} most recent entries out of ${worklogsData.worklogs.length} total*`;
    }

    // Add per-user daily breakdown if requested
    if (include_per_user && worklogsData?.worklogs) {
      const userDailyHours: { [user: string]: { [date: string]: { totalHours: number, billableHours: number, entries: number } } } = {};

      // Process worklogs to create user-date matrix
      worklogsData.worklogs.forEach((log: any) => {
        const user = log.authorDisplayName;
        const date = new Date(log.startDate).toISOString().split('T')[0];
        const hours = log.timeSpentHours || 0;
        const billableHours = log.billableHours || 0;

        if (!userDailyHours[user]) {
          userDailyHours[user] = {};
        }

        if (!userDailyHours[user][date]) {
          userDailyHours[user][date] = { totalHours: 0, billableHours: 0, entries: 0 };
        }

        userDailyHours[user][date].totalHours += hours;
        userDailyHours[user][date].billableHours += billableHours;
        userDailyHours[user][date].entries += 1;
      });

      // Sort users by total hours (most active first)
      const sortedUsers = Object.entries(userDailyHours)
        .map(([user, dates]) => ({
          user,
          totalHours: Object.values(dates).reduce((sum, day) => sum + day.totalHours, 0),
          activeDays: Object.keys(dates).length,
          avgDailyHours: Object.values(dates).reduce((sum, day) => sum + day.totalHours, 0) / Object.keys(dates).length
        }))
        .sort((a, b) => b.totalHours - a.totalHours)
        .slice(0, 15); // Top 15 users

      report += `\n\n## 👤 Daily Hours Per User Breakdown

### 📊 User Summary (Top ${sortedUsers.length} Active Users)
${sortedUsers.map((userData, i) =>
  `${i + 1}. **${userData.user}**: ${userData.totalHours.toFixed(1)}h total | ${userData.avgDailyHours.toFixed(1)}h avg/day | ${userData.activeDays} active days`
).join('\n')}

### 📅 Detailed Daily Hours by User
${sortedUsers.slice(0, 10).map(userData => {
  const userDates = userDailyHours[userData.user];
  const sortedDates = Object.keys(userDates).sort().slice(-7); // Last 7 days

  return `**${userData.user}** (${userData.totalHours.toFixed(1)}h total):
${sortedDates.map(date => {
    const day = userDates[date];
    const formattedDate = new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const billablePercent = day.totalHours > 0 ? ((day.billableHours / day.totalHours) * 100).toFixed(0) : '0';
    return `  • ${formattedDate}: ${day.totalHours.toFixed(1)}h (${billablePercent}% billable, ${day.entries} entries)`;
  }).join('\n')}`;
}).join('\n\n')}

*Showing detailed breakdown for top 10 users over last 7 days*`;
    }

    report += `\n\n---
*Analysis generated: ${new Date().toISOString()}*`;

    return {
      content: [
        {
          type: 'text',
          text: report
        }
      ]
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error fetching comprehensive daily hours data: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      ]
    };
  }
}

async function handleGetHajjefyOverview(args: any) {
  return {
    content: [
      {
        type: 'text',
        text: `# 🚀 Hajjefy - AI-Powered Time Tracking Analytics

Welcome to Hajjefy! I'm your AI assistant for analyzing Tempo.io time tracking data. I can help you uncover insights, track productivity, and understand team performance patterns.

## 🛠️ What I Can Do

### 📊 **Time Analytics**
- Comprehensive daily hours breakdown with day-by-day analysis
- **Per-user daily hours tracking** with individual productivity metrics
- Project/account allocation and time distribution
- Billable vs non-billable hours analysis with percentages
- Weekly patterns and productivity trends
- Specific worklog timestamps and detailed entries
- Export data in various formats

### 👥 **Team & User Insights**
- Get detailed user performance analytics
- **Individual daily hours per user** with billable breakdowns
- Analyze team workload distribution
- Track capacity and utilization rates
- Identify top performers and bottlenecks
- User ranking by productivity and active days

### 📈 **Advanced Analytics**
- Capacity analysis with holiday schemes and utilization tracking
- Peak activity analysis and productivity insights
- Weekly trend patterns (most/least productive days)
- Team workload rankings and performance scoring
- Timestamp-level worklog analysis with descriptions

## 🔥 Try These Sample Prompts

### **Getting Started**
- "Show me a time tracking summary for the last 30 days"
- "What's our team's billable vs non-billable hours breakdown?"
- "Give me daily hours for the past week with project breakdown"
- "Get comprehensive daily analysis with weekly trends"

### **Team Analysis**
- "Show me capacity analysis for all users"
- "Who are our most productive team members?"
- "What's the team workload distribution this month?"

### **User-Specific Insights**
- "Analyze Nadim Hajje's time tracking for the last month"
- "What's the utilization rate for users with 'john' in their name?"
- "Show me detailed analytics for a specific user"

### **Per-User Daily Tracking**
- "Get daily hours breakdown per individual user for the past week"
- "Show me daily hours per user with billable percentages"
- "Which users logged the most hours each day this month?"
- "Give me a user-by-user daily breakdown with entry counts"

### **Data Export & Reporting**
- "Export the last 60 days of data in CSV format"
- "Give me a comprehensive report with all details included"
- "Export billable hours data for this quarter"

### **Comprehensive Daily Hours Analysis**
- "Get daily breakdown from 2025-09-01 to 2025-09-20 with worklog timestamps"
- "Show me weekly patterns and project allocation for this month"
- "Give me detailed daily hours with specific worklog entries included"
- "Analyze daily hours with project breakdown and billable percentages"
- "Show comprehensive daily analysis including peak activity insights"
- "Get daily hours breakdown per individual user for the past week"
- "Show me daily hours per user with billable percentages"

### **Custom Date Ranges**
- "Show time summary from September 1 to September 15"
- "Analyze capacity for the last 90 days"
- "Get billable vs non-billable breakdown for Q3 2025"

## 💡 Pro Tips

1. **Be Specific**: Include date ranges, user names, or specific metrics you're interested in
2. **Ask Follow-ups**: "Can you break that down by user?" or "What about billable hours only?"
3. **Combine Insights**: "Show capacity analysis and then daily hours for over-capacity users"
4. **Export When Needed**: "Export this data to CSV" after getting insights you want to save

## 🎯 Popular Use Cases

- **Weekly Team Reviews**: Track team performance and identify trends
- **Capacity Planning**: Understand workload distribution and availability
- **Client Reporting**: Export billable hours for specific periods
- **Performance Analysis**: Identify top performers and optimization opportunities
- **Project Insights**: Analyze time allocation across different accounts

---

**Ready to explore your time tracking data? Just ask me anything about your team's productivity, individual performance, or specific time periods!**

*Powered by Hajjefy.com • Connected to your Tempo.io data*`
      }
    ]
  };
}

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // No console output in MCP mode - Claude Desktop expects clean JSON-RPC only
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});