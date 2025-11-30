import axios, { AxiosInstance } from 'axios';

export interface DashboardOverview {
  dateRange: {
    from: string;
    to: string;
  };
  totals: {
    hours: number;
    entries: string;
    activeDays: number;
    avgHoursPerDay: number;
  };
  topAccounts: Array<{
    account: string;
    total_hours: number;
    percentage: number;
  }>;
  topActivities: any[];
  recentDays: Array<{
    date: string;
    total_hours: number;
    entry_count: string;
  }>;
  database: {
    totalWorklogs: string;
    totalAttributes: string;
    dateRange: {
      earliest: string;
      latest: string;
    };
    uniqueAuthors: string;
    uniqueAccounts: string;
    status: string;
  };
  requestInfo: {
    parameters: Record<string, any>;
    functionName: string;
    timestamp: string;
  };
}

export interface BillableAnalysis {
  summary: {
    billableHours: number;
    nonBillableHours: number;
    billablePercentage: number;
  };
  topBillableAccounts?: Array<{
    account: string;
    billableHours: number;
  }>;
  monthlyTrend?: Array<{
    month: string;
    billableHours: number;
    billablePercentage: number;
  }>;
}

export class HajjefyApiClient {
  private client: AxiosInstance;

  constructor(baseUrl: string, apiToken: string) {
    this.client = axios.create({
      baseURL: baseUrl,
      timeout: 30000,
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          throw new Error('Authentication failed. Please check your HAJJEFY_API_TOKEN.');
        } else if (error.response?.status === 403) {
          throw new Error('Access denied. Token may lack required permissions.');
        }
        // For 404s, throw original error to preserve response property
        // This allows individual methods to handle 404s appropriately
        throw error;
      }
    );
  }

  async getDashboardOverview(days?: number, fromDate?: string, toDate?: string): Promise<DashboardOverview> {
    const params = new URLSearchParams();

    if (days) params.set('days', days.toString());
    if (fromDate) params.set('from', fromDate);
    if (toDate) params.set('to', toDate);

    const response = await this.client.get(`/api/dashboard/overview?${params.toString()}`);
    return response.data;
  }

  async getBillableAnalysis(days?: number, fromDate?: string, toDate?: string): Promise<BillableAnalysis> {
    const params = new URLSearchParams();

    if (days) params.set('days', days.toString());
    if (fromDate) params.set('from', fromDate);
    if (toDate) params.set('to', toDate);

    const response = await this.client.get(`/api/dashboard/billable-analysis?${params.toString()}`);
    return response.data;
  }

  async getUserAnalytics(username: string, days?: number): Promise<any> {
    const params = new URLSearchParams();
    if (days) params.set('days', days.toString());

    const response = await this.client.get(`/api/dashboard/user-profile/${username}?${params.toString()}`);
    return response.data;
  }

  async getTeamWorkload(days?: number): Promise<any> {
    const params = new URLSearchParams();
    if (days) params.set('days', days.toString());

    const response = await this.client.get(`/api/dashboard/team-workload-overview?${params.toString()}`);
    return response.data;
  }

  async getCapacityAnalysis(days?: number): Promise<any> {
    const params = new URLSearchParams();
    if (days) params.set('days', days.toString());

    const response = await this.client.get(`/api/dashboard/capacity-analysis?${params.toString()}`);
    return response.data;
  }

  async getDetailedWorklogs(days?: number, limit?: number, offset?: number): Promise<any> {
    const params = new URLSearchParams();
    if (days) params.set('days', days.toString());
    if (limit) params.set('limit', limit.toString());
    if (offset) params.set('offset', offset.toString());

    const response = await this.client.get(`/api/dashboard/worklogs?${params.toString()}`);
    return response.data;
  }

  async getSyncStatus(): Promise<any> {
    const response = await this.client.get('/api/sync/status');
    return response.data;
  }

  async getHealthStatus(): Promise<any> {
    const response = await this.client.get('/api/health');
    return response.data;
  }

  async getDailyHours(days?: number, fromDate?: string, toDate?: string): Promise<any> {
    const params = new URLSearchParams();
    if (days) params.set('days', days.toString());
    if (fromDate) params.set('from', fromDate);
    if (toDate) params.set('to', toDate);

    const response = await this.client.get(`/api/dashboard/daily?${params.toString()}`);
    return response.data;
  }

  async getAccountsBreakdown(days?: number, fromDate?: string, toDate?: string): Promise<any> {
    const params = new URLSearchParams();
    if (days) params.set('days', days.toString());
    if (fromDate) params.set('from', fromDate);
    if (toDate) params.set('to', toDate);

    const response = await this.client.get(`/api/dashboard/accounts?${params.toString()}`);
    return response.data;
  }

  async getCustomerAnalysis(customer: string, days?: number, fromDate?: string, toDate?: string): Promise<any> {
    // Get detailed worklogs to calculate customer-specific metrics
    const params = new URLSearchParams();
    if (days) params.set('days', days.toString());
    if (fromDate) params.set('from', fromDate);
    if (toDate) params.set('to', toDate);

    const response = await this.client.get(`/api/dashboard/worklogs?${params.toString()}`);
    return response.data;
  }

  async getUserCustomerAllocation(username: string, days?: number, fromDate?: string, toDate?: string): Promise<any> {
    // Get user profile which includes customer breakdown
    const params = new URLSearchParams();
    if (fromDate && toDate) {
      params.set('from', fromDate);
      params.set('to', toDate);
    }

    // Encode username for URL safety
    const encodedUsername = encodeURIComponent(username);
    const url = `/api/dashboard/user-profile/${encodedUsername}${params.toString() ? `?${params.toString()}` : ''}`;

    const response = await this.client.get(url);
    return response.data;
  }

  async getTAMAnalysis(days?: number, fromDate?: string, toDate?: string, customer?: string): Promise<any> {
    const params = new URLSearchParams();
    if (days) params.set('days', days.toString());
    if (fromDate) params.set('from', fromDate);
    if (toDate) params.set('to', toDate);
    if (customer) params.set('customer', customer);

    const response = await this.client.get(`/.netlify/functions/tam-analysis?${params.toString()}`);
    return response.data;
  }

  async getWorkloadRankings(days?: number, fromDate?: string, toDate?: string): Promise<any> {
    const params = new URLSearchParams();
    if (days) params.set('days', days.toString());
    if (fromDate) params.set('from', fromDate);
    if (toDate) params.set('to', toDate);

    const response = await this.client.get(`/.netlify/functions/workload-rankings?${params.toString()}`);
    return response.data;
  }

  async getSalesforceAccount(customer: string): Promise<any> {
    const params = new URLSearchParams();
    params.set('customer', customer);

    try {
      const response = await this.client.get(`/.netlify/functions/salesforce-account?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      // Return null if Salesforce integration is not configured or account not found
      if (error.response?.status === 404 || error.response?.status === 500) {
        return null;
      }
      throw error;
    }
  }
}