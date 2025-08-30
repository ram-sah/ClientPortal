import Airtable from 'airtable';

// Configure Airtable
const base = new Airtable({ 
  apiKey: process.env.AIRTABLE_API_KEY 
}).base(process.env.AIRTABLE_BASE_ID!);

export interface AirtableCompany {
  id: string;
  name: string;
  type: string;
  status: string;
  website?: string;
  industry?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  createdTime: string;
  [key: string]: any; // Allow for additional fields
}

class AirtableService {
  async getCompanies(tableName: string = 'Companies'): Promise<AirtableCompany[]> {
    try {
      const records = await base(tableName).select({
        view: 'Grid view' // Default view, can be customized
      }).all();

      return records.map(record => ({
        id: record.id,
        name: record.get('Name') as string || '',
        type: record.get('Type') as string || 'client',
        status: record.get('Status') as string || 'active',
        website: record.get('Website') as string,
        industry: record.get('Industry') as string,
        contactEmail: record.get('Contact Email') as string,
        contactPhone: record.get('Contact Phone') as string,
        address: record.get('Address') as string,
        city: record.get('City') as string,
        state: record.get('State') as string,
        zipCode: record.get('Zip Code') as string,
        country: record.get('Country') as string,
        createdTime: record.get('_createdTime') as string || new Date().toISOString(),
        // Include all other fields dynamically
        ...Object.fromEntries(
          Object.entries(record.fields).filter(([key]) => 
            !['Name', 'Type', 'Status', 'Website', 'Industry', 'Contact Email', 
             'Contact Phone', 'Address', 'City', 'State', 'Zip Code', 'Country', '_createdTime'].includes(key)
          )
        )
      }));
    } catch (error) {
      console.error('Error fetching companies from Airtable:', error);
      throw new Error(`Failed to fetch companies from Airtable: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getCompanyById(tableName: string = 'Companies', recordId: string): Promise<AirtableCompany | null> {
    try {
      const record = await base(tableName).find(recordId);
      
      return {
        id: record.id,
        name: record.get('Name') as string || '',
        type: record.get('Type') as string || 'client',
        status: record.get('Status') as string || 'active',
        website: record.get('Website') as string,
        industry: record.get('Industry') as string,
        contactEmail: record.get('Contact Email') as string,
        contactPhone: record.get('Contact Phone') as string,
        address: record.get('Address') as string,
        city: record.get('City') as string,
        state: record.get('State') as string,
        zipCode: record.get('Zip Code') as string,
        country: record.get('Country') as string,
        createdTime: record.get('_createdTime') as string || new Date().toISOString(),
        ...Object.fromEntries(
          Object.entries(record.fields).filter(([key]) => 
            !['Name', 'Type', 'Status', 'Website', 'Industry', 'Contact Email', 
             'Contact Phone', 'Address', 'City', 'State', 'Zip Code', 'Country', '_createdTime'].includes(key)
          )
        )
      };
    } catch (error) {
      console.error('Error fetching company from Airtable:', error);
      return null;
    }
  }

  async syncCompanyToDatabase(airtableCompany: AirtableCompany): Promise<void> {
    // This method can be used to sync Airtable data with your PostgreSQL database
    // Implementation depends on your specific sync requirements
    console.log('Syncing company to database:', airtableCompany.name);
  }
}

export const airtableService = new AirtableService();