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
        name: 'get_sync_status',
        description: 'Get sync status and data freshness information - when was the last sync and what date range is covered',
        inputSchema: {
          type: 'object',
          properties: {},
          additionalProperties: false,
        },
      },
      {
        name: 'get_customer_analysis',
        description: 'Get comprehensive customer analysis including hours breakdown, team allocation, and project details',
        inputSchema: {
          type: 'object',
          properties: {
            customer: {
              type: 'string',
              description: 'Customer name or account code to analyze (e.g., "DHL International", "Centcom", "DHLBILL", "CENTCOM2025")',
            },
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
          required: ['customer'],
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
      {
        name: 'get_user_customer_allocation',
        description: 'Get detailed customer/account time allocation for a specific user, showing how their hours are distributed across clients and projects',
        inputSchema: {
          type: 'object',
          properties: {
            username: {
              type: 'string',
              description: 'Username or full name to analyze (e.g., "John Smith", "nadim.hajje")',
            },
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
          required: ['username'],
          additionalProperties: false,
        },
      },
      {
        name: 'get_tam_insights',
        description: 'Get TAM (Technical Account Management) insights to identify which resources are best suited for TAM work on strategic accounts. Analyzes cross-charge hours, user performance on TAM activities, and provides recommendations for resource allocation.',
        inputSchema: {
          type: 'object',
          properties: {
            days: {
              type: 'number',
              description: 'Number of days to analyze (default: 90)',
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
            customer: {
              type: 'string',
              description: 'Filter by specific customer/account (optional)',
            },
            min_hours: {
              type: 'number',
              description: 'Minimum TAM hours threshold to include users (default: 5)',
              minimum: 0,
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
      case 'get_customer_analysis':
        return await handleGetCustomerAnalysis(args);
      case 'get_hajjefy_overview':
        return await handleGetHajjefyOverview(args);
      case 'get_sync_status':
        return await handleGetSyncStatus(args);
      case 'get_user_customer_allocation':
        return await handleGetUserCustomerAllocation(args);
      case 'get_tam_insights':
        return await handleGetTAMInsights(args);
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

    if (!userAnalytics.userProfile) {
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

// Helper function to extract customer name from account code
function getCustomerNameFromAccount(accountCode: string): string {
  // Remove common suffixes to get customer name
  const suffixes = ['BILL', 'BILLABLE', 'CSM', 'CSMSUPP', 'TECH', 'TECHSUP', 'SALES', 'SALESSU', 'NONBILL', 'H2H'];
  let customerName = accountCode;

  // Remove suffixes
  for (const suffix of suffixes) {
    if (customerName.endsWith(suffix)) {
      customerName = customerName.substring(0, customerName.length - suffix.length);
      break;
    }
  }

  // Handle special cases
  const customerMappings: { [key: string]: string } = {
    'DHL': 'DHL International',
    'CENTCOM2025': 'Centcom',
    'CENTENEDIA2526': 'Centene Media',
    'CENTENEMIG': 'Centene Migration',
    'INTERNAL': 'Internal',
    'INTERNALTI': 'Internal Time Off',
    'INTERNALTR': 'Internal Training',
    'RELATECARE': 'Relate Care',
    'SUPPORT': 'Support',
    'EDUCATION': 'Education',
    'AHOLDDEL': 'Ahold Delhaize',
    'ENCORECAP': 'Encore Capital',
    'MAXIMUS': 'Maximus',
    'MAXIMUSFED': 'Maximus Federal',
    'VIBRANT': 'Vibrant',
    'HYDROONE': 'Hydro One',
    'MAPFRE': 'Mapfre',
    'CAIXASEGURA': 'Caixa Segura',
    'CIELO': 'Cielo',
    'ZOOM-PART': 'Zoom Partner',
    'IHG': 'IHG',
    'TIHBENEFIT': 'TIH Benefit',
    'CUSTOMERS': 'Customers',
    'AMZNCNCT': 'Amazon Connect',
    'KONE': 'Kone',
    'USOSM': 'US OSM',
    'SIRIUSXM': 'SiriusXM',
    'TRUIST': 'Truist',
    'BRITISHCOUNCIL': 'British Council',
    'ZOOMNONBIL': 'Zoom Non-Billable',
    'WEX': 'WEX',
    'AUTOPASS': 'AutoPass',
    'OP360-NRAB': 'OP360 NRAB',
    'EQUATOR': 'Equator',
    'PEOPLES': 'Peoples',
    'PRULIFEUK': 'Prudential Life UK',
    'GANNETT': 'Gannett',
    'CHILQUINTA': 'Chilquinta',
    'EQUATORIAL': 'Equatorial',
    'AIS': 'AIS',
    'LIDERANCAS': 'Liderancas',
    'BIWORLDWIDE': 'BI Worldwide',
    'BANCOPAT': 'Banco PAT',
    'NYSOH': 'NYSOH',
    'TELMEX': 'Telmex',
    'WILLIAMS': 'Williams',
    'BURJEELMED': 'Burjeel Medical',
    'AMWELL': 'Amwell',
    'PARAGON': 'Paragon',
    'VISTAR': 'Vistar',
    'BANCOCOMPA': 'Banco Compa',
    'TMBTHANAACH': 'TMB Thanachart',
    'CONAGRA': 'Conagra',
    'REALPAGE': 'RealPage',
    'MILETO': 'Mileto',
    'BISCONTACT': 'BIS Contact',
    'BNSF': 'BNSF',
    'CIEE': 'CIEE'
  };

  return customerMappings[customerName] || customerName;
}

// Helper function to find customer account by name or code
function findCustomerAccount(accounts: any[], customerInput: string) {
  const input = customerInput.toLowerCase();

  // First try exact account code match
  let match = accounts.find((acc: any) => acc.account.toLowerCase() === input);
  if (match) return match;

  // Try customer name match
  match = accounts.find((acc: any) => {
    const customerName = getCustomerNameFromAccount(acc.account).toLowerCase();
    return customerName === input || customerName.includes(input);
  });
  if (match) return match;

  // Try partial account code match
  match = accounts.find((acc: any) => acc.account.toLowerCase().includes(input));
  if (match) return match;

  return null;
}

async function handleGetCustomerAnalysis(args: any) {
  try {
    const { customer, days = 30, from_date, to_date } = args;

    if (!customer) {
      throw new McpError(ErrorCode.InvalidParams, 'Customer parameter is required');
    }

    // Get the accounts breakdown
    const accountsData = await hajjefyClient.getAccountsBreakdown(days, from_date, to_date);

    // Find ALL accounts for this customer (not just one)
    const customerBaseCode = customer.toLowerCase().replace(/[^a-z]/g, '');
    const customerAccounts = accountsData.accounts?.filter((acc: any) => {
      const accountBaseCode = acc.account.toLowerCase().replace(/[^a-z]/g, '');
      return accountBaseCode.includes(customerBaseCode) ||
             getCustomerNameFromAccount(acc.account).toLowerCase().includes(customer.toLowerCase());
    }) || [];

    if (customerAccounts.length === 0) {
      // Fallback to single account search
      const singleAccount = findCustomerAccount(accountsData.accounts || [], customer);
      if (singleAccount) {
        customerAccounts.push(singleAccount);
      }
    }

    if (customerAccounts.length === 0) {
      // Suggest similar customers by name
      const similarCustomers = accountsData.accounts
        ?.filter((acc: any) => {
          const customerName = getCustomerNameFromAccount(acc.account).toLowerCase();
          return customerName.includes(customer.toLowerCase().substring(0, 3));
        })
        ?.slice(0, 5)
        ?.map((acc: any) => getCustomerNameFromAccount(acc.account)) || [];

      const suggestion = similarCustomers.length > 0
        ? `\n\n**Similar customers found:** ${similarCustomers.join(', ')}`
        : '';

      return {
        content: [
          {
            type: 'text',
            text: `❌ **Customer "${customer}" not found**\n\nPlease check the customer name spelling.${suggestion}\n\n**Top 10 active customers:**\n${accountsData.accounts?.slice(0, 10).map((acc: any, i: number) => `${i+1}. ${getCustomerNameFromAccount(acc.account)} (${acc.hours}h)`).join('\n') || 'No data available'}`
          }
        ]
      };
    }

    // Aggregate all customer accounts
    const aggregatedMetrics = customerAccounts.reduce((total: any, acc: any) => {
      // Only count as billable if the account category is 'Billable' or 'Centene'
      const isBillable = acc.category === 'Billable' || acc.category === 'Centene';
      const actualBillableHours = isBillable ? acc.hours : 0;

      return {
        totalHours: total.totalHours + acc.hours,
        totalEntries: total.totalEntries + acc.entries,
        billableHours: total.billableHours + actualBillableHours,
        totalPercentage: total.totalPercentage + acc.percentage
      };
    }, { totalHours: 0, totalEntries: 0, billableHours: 0, totalPercentage: 0 });

    // Use the primary account for ranking (first/largest account)
    const primaryAccount = customerAccounts.sort((a: any, b: any) => b.hours - a.hours)[0];

    // Build customer analysis report
    const dateRange = accountsData.dateRange || { from: 'N/A', to: 'N/A' };
    const customerName = getCustomerNameFromAccount(primaryAccount.account);

    let analysisReport = `# 📊 Customer Analysis: ${customerName}\n\n`;
    analysisReport += `## 📅 **Analysis Period**\n`;
    analysisReport += `- **Date Range**: ${dateRange.from} to ${dateRange.to}\n`;
    analysisReport += `- **Analysis Duration**: ${days} days\n\n`;

    // Customer overview with account breakdown
    analysisReport += `## 🏢 **Customer Overview**\n`;
    analysisReport += `- **Customer**: ${customerName}\n`;
    analysisReport += `- **Account Codes**: ${customerAccounts.map((acc: any) => acc.account).join(', ')}\n`;
    analysisReport += `- **Primary Category**: ${primaryAccount.category || 'N/A'}\n`;
    analysisReport += `- **Total Hours**: ${aggregatedMetrics.totalHours}h (across ${customerAccounts.length} account${customerAccounts.length > 1 ? 's' : ''})\n`;
    analysisReport += `- **Total Entries**: ${aggregatedMetrics.totalEntries} worklogs\n`;
    analysisReport += `- **Billable Hours**: ${aggregatedMetrics.billableHours}h\n`;
    analysisReport += `- **Share of Total Team**: ${aggregatedMetrics.totalPercentage.toFixed(1)}% of all hours\n\n`;

    // Account breakdown if multiple accounts
    if (customerAccounts.length > 1) {
      analysisReport += `## 📋 **Account Breakdown**\n`;
      customerAccounts.forEach((acc: any, index: number) => {
        const isBillable = acc.category === 'Billable' || acc.category === 'Centene';
        const billablePercent = isBillable ? '100%' : '0%';
        analysisReport += `${index + 1}. **${acc.account}** (${acc.category}): ${acc.hours}h, ${acc.entries} entries (${billablePercent} billable)\n`;
      });
      analysisReport += `\n`;
    }

    // Calculate actual date range for daily average
    const startDate = new Date(dateRange.from);
    const endDate = new Date(dateRange.to);
    const actualDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Ranking based on primary account
    const customerRank = accountsData.accounts?.findIndex((acc: any) =>
      acc.account.toLowerCase() === primaryAccount.account.toLowerCase()
    ) + 1 || 'N/A';

    const billablePercent = aggregatedMetrics.billableHours === aggregatedMetrics.totalHours ? '100%' : Math.round((aggregatedMetrics.billableHours / aggregatedMetrics.totalHours) * 100) + '%';

    analysisReport += `## 📈 **Core Metrics**\n`;
    analysisReport += `- **Total Hours**: ${aggregatedMetrics.totalHours} hours (${actualDays} days)\n`;
    analysisReport += `- **Total Worklogs**: ${aggregatedMetrics.totalEntries} entries\n`;
    analysisReport += `- **Billable Hours**: ${aggregatedMetrics.billableHours} hours (${billablePercent} billable)\n`;
    analysisReport += `- **Share of Total Team**: ${aggregatedMetrics.totalPercentage.toFixed(1)}% of all hours\n`;
    analysisReport += `- **Average per Entry**: ${(aggregatedMetrics.totalHours / aggregatedMetrics.totalEntries).toFixed(1)} hours${(aggregatedMetrics.totalHours / aggregatedMetrics.totalEntries) < 2 ? ' (efficient task management)' : (aggregatedMetrics.totalHours / aggregatedMetrics.totalEntries) > 8 ? ' (complex projects)' : ' (balanced workload)'}\n`;
    analysisReport += `- **Daily Average**: ${(aggregatedMetrics.totalHours / actualDays).toFixed(1)} hours per day\n`;
    analysisReport += `- **Primary Account Ranking**: #${customerRank} out of ${accountsData.accounts?.length || 0} accounts\n\n`;

    // Note about detailed analysis
    analysisReport += `## 🔗 **Detailed Analysis**\n`;
    analysisReport += `For comprehensive team breakdown, daily activity trends, and individual contributor metrics, visit:\n`;
    analysisReport += `**📊 [Customer Analysis Dashboard](https://hajjefy.com/customer-analysis?customer=${encodeURIComponent(customerName)})**\n\n`;

    // Category breakdown
    const categoryTotals = accountsData.accounts?.reduce((acc: any, account: any) => {
      const cat = account.category || 'Uncategorized';
      acc[cat] = (acc[cat] || 0) + account.hours;
      return acc;
    }, {}) || {};

    const customerCategoryHours = categoryTotals[primaryAccount.category || 'Uncategorized'] || 0;
    const categoryPercentage = customerCategoryHours > 0
      ? ((aggregatedMetrics.totalHours / customerCategoryHours) * 100).toFixed(1)
      : '0';

    analysisReport += `## 🏷️ **Category Analysis**\n`;
    analysisReport += `- **Primary Category**: ${primaryAccount.category || 'Uncategorized'}\n`;
    analysisReport += `- **Share of Category**: ${categoryPercentage}% of ${primaryAccount.category || 'Uncategorized'} hours\n`;
    analysisReport += `- **Category Total**: ${customerCategoryHours}h across all accounts\n\n`;

    // Top competitors in same category
    const competitorAccounts = accountsData.accounts
      ?.filter((acc: any) =>
        acc.category === primaryAccount.category &&
        !customerAccounts.some((custAcc: any) => custAcc.account === acc.account)
      )
      ?.slice(0, 5) || [];

    if (competitorAccounts.length > 0) {
      analysisReport += `## 🏁 **Top Competitors (Same Category)**\n`;
      competitorAccounts.forEach((comp: any, index: number) => {
        const compCustomerName = getCustomerNameFromAccount(comp.account);
        analysisReport += `${index + 1}. **${compCustomerName}**: ${comp.hours}h (${comp.percentage}%)\n`;
      });
      analysisReport += `\n`;
    }

    // Recommendations
    analysisReport += `## 💡 **Insights & Recommendations**\n`;

    if (customerRank <= 5) {
      analysisReport += `✅ **Top Performer** - This is one of your top 5 customers\n`;
    } else if (customerRank <= 20) {
      analysisReport += `⚡ **Strong Performer** - Solid contributor in top 20\n`;
    } else {
      analysisReport += `📈 **Growth Opportunity** - Potential to increase engagement\n`;
    }

    const avgHoursPerEntry = aggregatedMetrics.totalHours / aggregatedMetrics.totalEntries;
    if (avgHoursPerEntry > 8) {
      analysisReport += `⏰ **High-Intensity Work** - Average ${avgHoursPerEntry.toFixed(1)}h per entry\n`;
    } else if (avgHoursPerEntry < 2) {
      analysisReport += `⚡ **Quick Tasks** - Efficient ${avgHoursPerEntry.toFixed(1)}h per entry\n`;
    }

    analysisReport += `\n---\n*Analysis generated: ${new Date().toISOString()}*`;

    return {
      content: [
        {
          type: 'text',
          text: analysisReport
        }
      ]
    };

  } catch (error) {
    console.error('Error in handleGetCustomerAnalysis:', error);
    throw new McpError(ErrorCode.InternalError, `Failed to get customer analysis: ${error}`);
  }
}

async function handleGetSyncStatus(args: any) {
  try {
    // Get database info from overview endpoint
    const overview = await hajjefyClient.getDashboardOverview(1); // Just need database info
    const database = overview.database;

    // Calculate data freshness
    const latestDate = new Date(database.dateRange.latest);
    const currentDate = new Date();
    const daysSinceSync = Math.floor((currentDate.getTime() - latestDate.getTime()) / (1000 * 60 * 60 * 24));

    // Determine sync status
    let syncStatus = '🟢 Up to Date';
    let freshness = 'Current';

    if (daysSinceSync === 0) {
      syncStatus = '🟢 Current (Today)';
      freshness = 'Latest data is from today';
    } else if (daysSinceSync === 1) {
      syncStatus = '🟡 1 Day Behind';
      freshness = 'Latest data is from yesterday';
    } else if (daysSinceSync <= 3) {
      syncStatus = `🟡 ${daysSinceSync} Days Behind`;
      freshness = `Latest data is ${daysSinceSync} days old`;
    } else {
      syncStatus = `🔴 ${daysSinceSync} Days Behind`;
      freshness = `Latest data is ${daysSinceSync} days old - sync may be needed`;
    }

    // Calculate date range coverage
    const earliestDate = new Date(database.dateRange.earliest);
    const totalDays = Math.floor((latestDate.getTime() - earliestDate.getTime()) / (1000 * 60 * 60 * 24));

    return {
      content: [
        {
          type: 'text',
          text: `# 🔄 Hajjefy Data Sync Status

## 📊 **Current Sync Status**
**${syncStatus}**

## ⏰ **Data Freshness**
- **Last Sync Date**: ${latestDate.toLocaleDateString()} (${latestDate.toLocaleDateString('en-US', { weekday: 'long' })})
- **Freshness**: ${freshness}
- **Days Since Last Sync**: ${daysSinceSync} days

## 📅 **Data Coverage**
- **Date Range**: ${earliestDate.toLocaleDateString()} to ${latestDate.toLocaleDateString()}
- **Total Coverage**: ${totalDays} days
- **Start Date**: ${earliestDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
- **End Date**: ${latestDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

## 📈 **Database Statistics**
- **Total Worklogs**: ${parseInt(database.totalWorklogs).toLocaleString()} entries
- **Total Attributes**: ${parseInt(database.totalAttributes).toLocaleString()} data points
- **Unique Users**: ${database.uniqueAuthors} active users
- **Unique Accounts**: ${database.uniqueAccounts} projects/accounts
- **Connection Status**: ${database.status === 'connected' ? '✅ Connected' : '❌ Disconnected'}

## 💡 **Recommendations**
${daysSinceSync === 0 ?
  '✅ Data is current - no action needed' :
  daysSinceSync <= 3 ?
  '⚠️ Consider running a sync to get the latest data' :
  '🚨 Data is stale - sync recommended to ensure accuracy'}

---
*Status checked: ${new Date().toISOString()}*`
        }
      ]
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `# 🔄 Sync Status Error

❌ **Unable to retrieve sync status**

${error instanceof Error ? error.message : 'Unknown error occurred'}

This could indicate:
- API connectivity issues
- Authentication problems
- Server maintenance

**Try again in a few moments or check your Hajjefy dashboard directly.**`
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

async function handleGetUserCustomerAllocation(args: any) {
  const { username, days = 30, from_date, to_date } = args;

  try {
    // Get user's customer allocation from user profile endpoint
    const userProfile = await hajjefyClient.getUserCustomerAllocation(username, days, from_date, to_date);

    if (!userProfile || !userProfile.userProfile) {
      return {
        content: [
          {
            type: 'text',
            text: `# Customer Time Allocation: ${username}

❌ **User not found or no data available**

This could mean:
- User name "${username}" doesn't exist in the system
- No time entries found for the specified period
- User might be using a different name format (try full name like "John Smith" or username like "john.doe")

**Tip**: Try searching with different name variations or check if the user has logged time in the selected date range.`
          }
        ]
      };
    }

    const profile = userProfile.userProfile;
    const topCustomers = userProfile.topCustomers || [];

    // Calculate date range for display
    let dateRangeText = '';
    if (from_date && to_date) {
      dateRangeText = `${from_date} to ${to_date}`;
    } else {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - (days || 30));
      dateRangeText = `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`;
    }

    // Calculate total hours for percentage calculations
    const totalHours = topCustomers.reduce((sum: number, customer: any) => sum + customer.hours, 0);

    return {
      content: [
        {
          type: 'text',
          text: `# Customer Time Allocation: ${profile.displayName}
**Period**: ${dateRangeText}

## 👤 User Overview
- **Total Hours**: ${totalHours.toFixed(1)} hours
- **Billable Hours**: ${profile.billableHours?.toFixed(1) || '0.0'} hours (${profile.billablePercentage?.toFixed(1) || '0'}%)
- **Active Days**: ${profile.activeDays || 'N/A'} days
- **Utilization**: ${profile.utilizationPercentage?.toFixed(1) || 'N/A'}%

## 🏢 Customer/Account Breakdown

${topCustomers.length > 0 ? topCustomers.map((customer: any, i: number) => {
  const percentage = totalHours > 0 ? (customer.hours / totalHours * 100).toFixed(1) : '0.0';
  const billablePercentage = customer.hours > 0 ? (customer.billableHours / customer.hours * 100).toFixed(1) : '0.0';

  return `### ${i + 1}. ${customer.customerName}
- **Total Hours**: ${customer.hours.toFixed(1)}h (${percentage}% of user's time)
- **Billable Hours**: ${customer.billableHours.toFixed(1)}h (${billablePercentage}% billable)
- **Worklogs**: ${customer.worklogCount} entries
${customer.accounts && customer.accounts.length > 0 ? `- **Accounts**: ${customer.accounts.join(', ')}` : ''}`;
}).join('\n\n') : 'No customer data available for this period.'}

## 📊 Time Distribution Summary
${topCustomers.length > 0 ? `
**Top 3 Customers by Hours:**
${topCustomers.slice(0, 3).map((customer: any, i: number) =>
  `${i + 1}. ${customer.customerName}: ${customer.hours.toFixed(1)}h (${totalHours > 0 ? (customer.hours / totalHours * 100).toFixed(1) : '0'}%)`
).join('\n')}

**Overall Statistics:**
- **Most Active Customer**: ${topCustomers[0]?.customerName || 'N/A'} (${topCustomers[0]?.hours?.toFixed(1) || '0'}h)
- **Customer Diversity**: Working with ${topCustomers.length} different customers
- **Average Hours per Customer**: ${topCustomers.length > 0 ? (totalHours / topCustomers.length).toFixed(1) : '0'}h
` : '**No time allocation data available for the specified period.**'}

## 💡 Insights
${topCustomers.length > 0 ? `
- ${profile.displayName} allocated the most time to **${topCustomers[0]?.customerName}** (${topCustomers[0] ? (topCustomers[0].hours / totalHours * 100).toFixed(1) : '0'}% of total hours)
${topCustomers.length > 1 ? `- Second most active customer is **${topCustomers[1]?.customerName}** (${topCustomers[1] ? (topCustomers[1].hours / totalHours * 100).toFixed(1) : '0'}% of total hours)` : ''}
- Overall billable rate: ${profile.billablePercentage?.toFixed(1) || '0'}%
${topCustomers.length >= 3 ? `- Working with ${topCustomers.length} customers shows good client diversity` : ''}
` : '- No customer allocation data available - user may not have logged time in this period or data may not be properly categorized.'}

**Note**: This analysis shows how ${profile.displayName}'s time is distributed across different customers/clients based on account mappings in the Tempo.io system.`
        }
      ]
    };
  } catch (error) {
    console.error('Error in handleGetUserCustomerAllocation:', error);
    return {
      content: [
        {
          type: 'text',
          text: `# Customer Time Allocation: ${username}

❌ **Error retrieving customer allocation data**

${error instanceof Error ? error.message : 'Unknown error occurred'}

**Troubleshooting Tips:**
- Verify the username is spelled correctly
- Try using the full name format (e.g., "John Smith")
- Check if the user has logged time in the specified date range
- Ensure the user exists in the Hajjefy system

**Need help?** Contact your Hajjefy administrator.`
        }
      ]
    };
  }
}

async function handleGetTAMInsights(args: any) {
  const { days = 90, from_date, to_date, customer, min_hours = 5 } = args;

  try {
    // Fetch TAM analysis and workload rankings in parallel
    const [tamData, workloadData] = await Promise.all([
      hajjefyClient.getTAMAnalysis(days, from_date, to_date, customer),
      hajjefyClient.getWorkloadRankings(days, from_date, to_date)
    ]);

    if (!tamData || !workloadData) {
      return {
        content: [
          {
            type: 'text',
            text: '❌ **Unable to fetch TAM analysis data**\n\nPlease ensure the TAM analysis endpoints are available and properly configured.'
          }
        ]
      };
    }

    // Extract TAM user rankings and filter by minimum hours
    const topTAMUsers = (tamData.topTAMUsers || [])
      .filter((user: any) => user.tamHours >= min_hours)
      .map((user: any) => {
        // Find corresponding user in workload data for additional metrics
        const workloadUser = workloadData.rankings?.topByTAM?.find(
          (wu: any) => wu.userName === user.userName
        );

        return {
          userName: user.userName,
          tamHours: user.tamHours,
          worklogCount: user.worklogCount,
          totalHours: workloadUser?.totalHours || 0,
          tamPercentage: workloadUser?.totalHours > 0 ?
            (user.tamHours / workloadUser.totalHours * 100).toFixed(1) : '0',
        };
      });

    // Categorize users by TAM expertise level
    const experts = topTAMUsers.filter((u: any) => u.tamHours >= 40);
    const experienced = topTAMUsers.filter((u: any) => u.tamHours >= 20 && u.tamHours < 40);
    const developing = topTAMUsers.filter((u: any) => u.tamHours >= min_hours && u.tamHours < 20);

    // Calculate TAM coverage by role type
    const roleBreakdown = tamData.byRole || [];
    const totalTAMHours = tamData.summary?.totalCrossChargeHours || 0;

    // Build strategic recommendations
    const recommendations = [];

    if (experts.length === 0) {
      recommendations.push('⚠️ **No TAM experts identified** - Consider developing TAM capabilities within the team');
    } else if (experts.length < 3) {
      recommendations.push(`⚠️ **Limited TAM expertise** - Only ${experts.length} expert${experts.length > 1 ? 's' : ''} identified. Consider cross-training more team members`);
    }

    if (customer) {
      recommendations.push(`📊 **Customer Focus**: Analysis filtered for ${customer}. Review customer-specific TAM resource allocation.`);
    }

    // Identify best resources for strategic accounts
    const bestForStrategic = topTAMUsers.slice(0, 5).map((user: any, i: number) => {
      let expertise = 'Expert';
      if (user.tamHours < 20) expertise = 'Developing';
      else if (user.tamHours < 40) expertise = 'Experienced';

      return `${i + 1}. **${user.userName}** (${expertise})
   - TAM Hours: ${user.tamHours.toFixed(1)}h (${user.tamPercentage}% of total time)
   - Total Hours: ${user.totalHours.toFixed(1)}h
   - Worklogs: ${user.worklogCount} TAM activities
   - **Recommendation**: ${getResourceRecommendation(user)}`;
    });

    // Generate comprehensive report
    const dateRangeText = tamData.dateRange ?
      `${tamData.dateRange.from} to ${tamData.dateRange.to}` :
      `Last ${days} days`;

    let report = `# 🎯 TAM Resource Insights & Strategic Account Allocation
**Analysis Period**: ${dateRangeText}${customer ? ` | **Customer**: ${customer}` : ''}

## 📊 TAM Activity Overview
- **Total Cross-Charge Hours**: ${totalTAMHours.toFixed(1)}h
- **Total TAM Resources**: ${topTAMUsers.length} users (≥${min_hours}h)
- **TAM Experts**: ${experts.length} users (≥40h)
- **Experienced TAM**: ${experienced.length} users (20-40h)
- **Developing TAM**: ${developing.length} users (${min_hours}-20h)

## 🏆 Best Resources for Strategic Accounts

${bestForStrategic.join('\n\n')}

## 📈 TAM Coverage by Role Type

${roleBreakdown.map((role: any) => {
  const percentage = totalTAMHours > 0 ? (role.totalHours / totalTAMHours * 100).toFixed(1) : '0';
  return `### ${role.roleType}
- **Hours**: ${role.totalHours.toFixed(1)}h (${percentage}% of TAM work)
- **Billable**: ${role.billableHours.toFixed(1)}h (${role.billablePercentage.toFixed(1)}% billable)
- **Accounts**: ${role.accountCount} cross-charge accounts
- **Worklogs**: ${role.worklogCount} activities`;
}).join('\n\n')}

## 🎓 Expertise Breakdown

### 🌟 TAM Experts (≥40h)
${experts.length > 0 ? experts.slice(0, 5).map((user: any) =>
  `- **${user.userName}**: ${user.tamHours.toFixed(1)}h TAM (${user.tamPercentage}% of time)`
).join('\n') : '_No experts in this period_'}

### ⭐ Experienced (20-40h)
${experienced.length > 0 ? experienced.slice(0, 5).map((user: any) =>
  `- **${user.userName}**: ${user.tamHours.toFixed(1)}h TAM (${user.tamPercentage}% of time)`
).join('\n') : '_No experienced users in this period_'}

### 📚 Developing (${min_hours}-20h)
${developing.length > 0 ? developing.slice(0, 5).map((user: any) =>
  `- **${user.userName}**: ${user.tamHours.toFixed(1)}h TAM (${user.tamPercentage}% of time)`
).join('\n') : '_No developing users in this period_'}

## 💡 Strategic Recommendations

${recommendations.length > 0 ? recommendations.map(r => `${r}`).join('\n\n') : '_No specific recommendations at this time_'}

### Resource Allocation Strategy
${experts.length > 0 ? `
✅ **Primary TAM Resources** (Experts): ${experts.slice(0, 3).map((u: any) => u.userName).join(', ')}
   - Best suited for complex strategic accounts
   - High customer-facing experience
   - Proven track record in TAM activities
` : ''}
${experienced.length > 0 ? `
⚡ **Secondary TAM Resources** (Experienced): ${experienced.slice(0, 3).map((u: any) => u.userName).join(', ')}
   - Good for mid-tier strategic accounts
   - Can support experts on complex engagements
   - Ready for advancement to expert level
` : ''}
${developing.length > 0 ? `
📈 **Development Opportunities**: ${developing.slice(0, 3).map((u: any) => u.userName).join(', ')}
   - Shadow expert TAM resources
   - Assign to smaller strategic accounts
   - Provide TAM-specific training
` : ''}

## 🔗 Next Steps

1. **Review Top Performers**: Analyze detailed user profiles for top TAM resources
2. **Customer Matching**: Use customer analysis to match resources to strategic accounts
3. **Skill Development**: Identify training needs for developing TAM resources
4. **Capacity Planning**: Assess if current TAM capacity meets strategic account demands

---
*Analysis generated: ${new Date().toISOString()}*
*Minimum TAM hours threshold: ${min_hours}h*`;

    return {
      content: [
        {
          type: 'text',
          text: report
        }
      ]
    };
  } catch (error) {
    console.error('Error in handleGetTAMInsights:', error);
    return {
      content: [
        {
          type: 'text',
          text: `# TAM Insights Error

❌ **Failed to retrieve TAM insights**

${error instanceof Error ? error.message : 'Unknown error occurred'}

**Troubleshooting:**
- Verify TAM analysis endpoint is available
- Check API connectivity and authentication
- Ensure sufficient data exists for the specified period
- Try a different date range or remove customer filter

**Need help?** Contact your Hajjefy administrator.`
        }
      ]
    };
  }
}

// Helper function to generate resource recommendation
function getResourceRecommendation(user: any): string {
  const tamPercent = parseFloat(user.tamPercentage);
  const tamHours = user.tamHours;

  if (tamHours >= 60 && tamPercent >= 30) {
    return '🌟 **Strategic Account Lead** - High TAM focus and proven expertise. Ideal for top-tier strategic accounts.';
  } else if (tamHours >= 40) {
    return '⭐ **Senior TAM Resource** - Strong TAM capability. Suitable for complex strategic accounts or mentoring roles.';
  } else if (tamHours >= 20 && tamPercent >= 20) {
    return '✅ **Active TAM Contributor** - Good TAM engagement. Ready for mid-tier strategic accounts.';
  } else if (tamHours >= 20) {
    return '📊 **TAM Support Role** - Experienced but lower % allocation. Best for supporting larger strategic accounts.';
  } else {
    return '📚 **Developing TAM Skills** - Building TAM experience. Pair with expert for skill development.';
  }
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