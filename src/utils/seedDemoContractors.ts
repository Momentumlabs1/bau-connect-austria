import { supabase } from "@/integrations/supabase/client";

interface DemoContractor {
  email: string;
  password: string;
  company_name: string;
  trades: string[];
  description: string;
  postal_codes: string[];
  rating: number;
  total_reviews: number;
  wallet_balance: number;
  service_radius: number;
  min_project_value: number;
}

const demoContractors: DemoContractor[] = [
  {
    email: 'schmidt@elektro-demo.at',
    password: 'Demo123!',
    company_name: 'Elektro Schmidt GmbH',
    trades: ['elektriker'],
    description: 'Erfahrener Elektriker-Betrieb mit 20 Jahren Erfahrung. Spezialisiert auf PV-Anlagen und Smart Home.',
    postal_codes: ['4320', '4321', '4322', '4323'],
    rating: 4.8,
    total_reviews: 45,
    wallet_balance: 500,
    service_radius: 50,
    min_project_value: 300
  },
  {
    email: 'mueller@strom-demo.at',
    password: 'Demo123!',
    company_name: 'Strom & Licht Müller',
    trades: ['elektriker'],
    description: 'Moderner Elektro-Betrieb für alle elektrischen Installationen.',
    postal_codes: ['4320', '4324', '4325'],
    rating: 4.6,
    total_reviews: 32,
    wallet_balance: 350,
    service_radius: 40,
    min_project_value: 300
  },
  {
    email: 'wagner@heizung-demo.at',
    password: 'Demo123!',
    company_name: 'Heizung & Bad Wagner',
    trades: ['sanitar-heizung'],
    description: 'Komplettlösungen für Heizung, Bad und Sanitär. Notdienst 24/7 verfügbar.',
    postal_codes: ['4320', '4321', '4322'],
    rating: 4.9,
    total_reviews: 67,
    wallet_balance: 600,
    service_radius: 60,
    min_project_value: 500
  },
  {
    email: 'huber@installateur-demo.at',
    password: 'Demo123!',
    company_name: 'Installateur Huber',
    trades: ['sanitar-heizung'],
    description: 'Ihr Partner für moderne Heizsysteme und Badsanierungen.',
    postal_codes: ['4320', '4323', '4324'],
    rating: 4.7,
    total_reviews: 53,
    wallet_balance: 450,
    service_radius: 45,
    min_project_value: 500
  },
  {
    email: 'koenig@dach-demo.at',
    password: 'Demo123!',
    company_name: 'Dach & Fassade König',
    trades: ['dachdecker'],
    description: 'Professionelle Dachsanierung und Reparaturen. Mehr als 30 Jahre Erfahrung.',
    postal_codes: ['4320', '4321', '4322', '4323'],
    rating: 4.8,
    total_reviews: 58,
    wallet_balance: 700,
    service_radius: 70,
    min_project_value: 1000
  },
  {
    email: 'bauer@bedachung-demo.at',
    password: 'Demo123!',
    company_name: 'Bedachungen Bauer',
    trades: ['dachdecker'],
    description: 'Spezialist für Flachdächer und Dachziegel. Kompetent und zuverlässig.',
    postal_codes: ['4320', '4324', '4325'],
    rating: 4.6,
    total_reviews: 41,
    wallet_balance: 550,
    service_radius: 50,
    min_project_value: 1000
  },
  {
    email: 'gruber@fassade-demo.at',
    password: 'Demo123!',
    company_name: 'Fassadenbau Gruber',
    trades: ['fassade'],
    description: 'Experten für Fassadenanstrich, WDVS und thermische Sanierung.',
    postal_codes: ['4320', '4321', '4322'],
    rating: 4.7,
    total_reviews: 39,
    wallet_balance: 480,
    service_radius: 55,
    min_project_value: 800
  },
  {
    email: 'steiner@fassadenprofi-demo.at',
    password: 'Demo123!',
    company_name: 'Fassadenprofi Steiner',
    trades: ['fassade'],
    description: 'Moderne Fassadengestaltung und professionelle Dämmung.',
    postal_codes: ['4320', '4323', '4324'],
    rating: 4.8,
    total_reviews: 46,
    wallet_balance: 520,
    service_radius: 50,
    min_project_value: 800
  },
  {
    email: 'fuchs@maler-demo.at',
    password: 'Demo123!',
    company_name: 'Malermeister Fuchs',
    trades: ['maler'],
    description: 'Ihr Malermeister für Innen- und Außenarbeiten. Qualität seit 1995.',
    postal_codes: ['4320', '4321', '4322', '4323'],
    rating: 4.9,
    total_reviews: 72,
    wallet_balance: 400,
    service_radius: 40,
    min_project_value: 250
  },
  {
    email: 'berger@farbe-demo.at',
    password: 'Demo123!',
    company_name: 'Farbe & Form Berger',
    trades: ['maler'],
    description: 'Kreative Malerarbeiten und professionelle Lackierungen.',
    postal_codes: ['4320', '4324', '4325'],
    rating: 4.7,
    total_reviews: 51,
    wallet_balance: 380,
    service_radius: 35,
    min_project_value: 250
  }
];

export async function seedDemoContractors() {
  const results = [];
  
  for (const contractor of demoContractors) {
    try {
      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: contractor.email,
        password: contractor.password,
        options: {
          data: {
            role: 'contractor',
            first_name: contractor.company_name.split(' ')[0],
            last_name: contractor.company_name.split(' ').slice(1).join(' ')
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('User creation failed');

      // Create contractor profile
      const { error: contractorError } = await supabase
        .from('contractors')
        .insert({
          id: authData.user.id,
          company_name: contractor.company_name,
          trades: contractor.trades,
          postal_codes: contractor.postal_codes,
          city: 'Perg',
          address: 'Demo Adresse',
          description: contractor.description,
          wallet_balance: contractor.wallet_balance,
          rating: contractor.rating,
          total_reviews: contractor.total_reviews,
          verified: true,
          handwerker_status: 'REGISTERED',
          service_radius: contractor.service_radius,
          min_project_value: contractor.min_project_value,
          accepts_urgent: true
        });

      if (contractorError) throw contractorError;

      results.push({ email: contractor.email, success: true });
    } catch (error: any) {
      results.push({ email: contractor.email, success: false, error: error.message });
    }
  }

  return results;
}
