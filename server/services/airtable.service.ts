interface AirtableCompany {
  id: string;
  name: string;
  type: string;
  website?: string;
  contactEmail?: string;
  contactPhone?: string;
  city?: string;
  state?: string;
  industry?: string;
}

class AirtableService {
  private baseUrl: string;
  private apiKey: string;
  private baseId: string;

  constructor() {
    this.apiKey = process.env.AIRTABLE_API_KEY || '';
    this.baseId = process.env.AIRTABLE_BASE_ID || '';
    this.baseUrl = `https://api.airtable.com/v0/${this.baseId}`;
  }

  async getCompanies(): Promise<AirtableCompany[]> {
    try {
      if (!this.apiKey || !this.baseId) {
        console.log('Airtable credentials not configured');
        return [];
      }

      const response = await fetch(`${this.baseUrl}/Companies`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Airtable API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Transform Airtable records to match our company interface
      return data.records.map((record: any) => ({
        id: record.id,
        name: record.fields.Name || '',
        type: record.fields.Type?.toLowerCase() || 'client',
        website: record.fields.Website,
        contactEmail: record.fields.Email,
        contactPhone: record.fields.Phone,
        city: record.fields.City,
        state: record.fields.State,
        industry: record.fields.Industry
      }));
    } catch (error) {
      console.error('Error fetching Airtable companies:', error);
      return [];
    }
  }
}

export default new AirtableService();