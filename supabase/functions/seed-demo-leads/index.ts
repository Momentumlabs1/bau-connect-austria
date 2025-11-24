import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const DEMO_PROJECTS = [
  {
    title: 'Elektroinstallation Neubau',
    gewerk_id: 'elektriker',
    city: 'Perg',
    postal_code: '4320',
    urgency: 'normal',
    estimated_value: 8500,
    description: 'Komplette Elektroinstallation für Einfamilienhaus-Neubau. Ca. 150m² Wohnfläche. Inkl. Verteilerschrank, Steckdosen, Lichtschalter, Außenbeleuchtung.',
    projekt_typ: 'Neubau Elektroinstallation'
  },
  {
    title: 'Heizungsmodernisierung',
    gewerk_id: 'sanitar-heizung',
    city: 'Wien',
    postal_code: '1060',
    urgency: 'sofort',
    estimated_value: 12000,
    description: 'Austausch alter Ölheizung gegen moderne Wärmepumpe. Inklusive Heizkörper-Optimierung und Smart-Home-Integration.',
    projekt_typ: 'Heizungssanierung'
  },
  {
    title: 'Dachreparatur nach Sturm',
    gewerk_id: 'dachdecker',
    city: 'Linz',
    postal_code: '4020',
    urgency: 'sofort',
    estimated_value: 6500,
    description: 'Notfall-Reparatur nach Sturmschaden. Ca. 30m² beschädigte Dachziegel müssen ersetzt werden. Dringlich wegen Regenwetter.',
    projekt_typ: 'Dachreparatur Sturm'
  },
  {
    title: 'Fassadendämmung Altbau',
    gewerk_id: 'fassade',
    city: 'Salzburg',
    postal_code: '5020',
    urgency: 'normal',
    estimated_value: 25000,
    description: 'Thermische Sanierung eines Mehrfamilienhauses (Baujahr 1970). Ca. 300m² Fassadenfläche. Vollwärmeschutz mit mineralischem Dämmputz.',
    projekt_typ: 'Fassadensanierung'
  },
  {
    title: 'Innenmalerei Wohnung',
    gewerk_id: 'maler',
    city: 'Graz',
    postal_code: '8010',
    urgency: 'flexibel',
    estimated_value: 3500,
    description: 'Malerarbeiten in 80m² Wohnung. Alle Wände und Decken weiß streichen. Türen und Fensterrahmen lackieren.',
    projekt_typ: 'Wohnungsmalerei'
  },
  {
    title: 'Photovoltaik-Anlage Installation',
    gewerk_id: 'elektriker',
    city: 'Wels',
    postal_code: '4600',
    urgency: 'normal',
    estimated_value: 15000,
    description: 'Installation 8 kWp Photovoltaik-Anlage auf Schrägdach. Inkl. Wechselrichter, Speicher und Anschluss ans Stromnetz.',
    projekt_typ: 'PV-Anlage Montage'
  },
  {
    title: 'Badezimmer Komplettsanierung',
    gewerk_id: 'sanitar-heizung',
    city: 'Innsbruck',
    postal_code: '6020',
    urgency: 'normal',
    estimated_value: 18000,
    description: 'Komplette Badsanierung inkl. neuer Fliesen, Sanitärobjekte, Dusche, Bodenheizung. Ca. 12m² Badfläche.',
    projekt_typ: 'Bad-Sanierung'
  },
  {
    title: 'Dachausbau mit Isolierung',
    gewerk_id: 'dachdecker',
    city: 'Klagenfurt',
    postal_code: '9020',
    urgency: 'flexibel',
    estimated_value: 22000,
    description: 'Dachgeschoss-Ausbau mit Wärmedämmung. Neue Dachfenster, Dampfsperre, Mineralwolle-Dämmung. Ca. 70m² Wohnfläche.',
    projekt_typ: 'Dachausbau'
  },
  {
    title: 'Außenfassade Neubau',
    gewerk_id: 'fassade',
    city: 'Wien',
    postal_code: '1020',
    urgency: 'normal',
    estimated_value: 32000,
    description: 'Fassadengestaltung Neubau Mehrfamilienhaus. Vollwärmeschutz, Fassadenputz, Sockel. Ca. 450m² Fassadenfläche.',
    projekt_typ: 'Fassade Neubau'
  },
  {
    title: 'Fassadenanstrich Einfamilienhaus',
    gewerk_id: 'maler',
    city: 'Perg',
    postal_code: '4320',
    urgency: 'flexibel',
    estimated_value: 5500,
    description: 'Fassadenanstrich Einfamilienhaus. Grundierung und 2x Deckanstrich. Ca. 180m² Fassadenfläche. Gerüst vorhanden.',
    projekt_typ: 'Fassadenanstrich'
  }
]

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  console.log('🌱 Starting demo leads seeding...')

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error('❌ No Authorization header')
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      console.error('❌ Invalid token')
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('✅ Authenticated user:', user.id)

    // Get or create demo customer
    const demoCustomerEmail = 'demo.customer@bauconnect24.at'
    
    let demoCustomerId: string
    
    // Check if demo customer exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const existingDemoUser = existingUsers?.users.find(u => u.email === demoCustomerEmail)
    
    if (existingDemoUser) {
      demoCustomerId = existingDemoUser.id
      console.log('✅ Demo customer exists:', demoCustomerId)
    } else {
      // Create demo customer
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: demoCustomerEmail,
        password: 'Demo123!',
        email_confirm: true,
        user_metadata: {
          role: 'customer'
        }
      })
      
      if (createError || !newUser.user) {
        throw new Error(`Failed to create demo customer: ${createError?.message}`)
      }
      
      demoCustomerId = newUser.user.id
      console.log('✅ Created demo customer:', demoCustomerId)
      
      // Create profile
      await supabase.from('profiles').insert({
        id: demoCustomerId,
        email: demoCustomerEmail,
        first_name: 'Demo',
        last_name: 'Kunde'
      })
      
      // Create user role
      await supabase.from('user_roles').insert({
        user_id: demoCustomerId,
        role: 'customer'
      })
    }

    // Create demo projects
    const createdProjects = []
    
    for (const demoProject of DEMO_PROJECTS) {
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          customer_id: demoCustomerId,
          title: demoProject.title,
          gewerk_id: demoProject.gewerk_id,
          city: demoProject.city,
          postal_code: demoProject.postal_code,
          urgency: demoProject.urgency,
          estimated_value: demoProject.estimated_value,
          description: demoProject.description,
          projekt_typ: demoProject.projekt_typ,
          status: 'open',
          visibility: 'public',
          final_price: 35, // Base demo price
          base_price: 30
        })
        .select()
        .single()
      
      if (projectError) {
        console.error('❌ Error creating project:', projectError)
        continue
      }
      
      createdProjects.push(project)
      console.log('✅ Created project:', project.titel || project.projekt_typ)
    }

    // Get demo contractors (verified contractors with trades)
    const { data: contractors } = await supabase
      .from('contractors')
      .select('id, company_name, trades')
      .eq('verified', true)
      .limit(10)

    console.log(`👷 Found ${contractors?.length || 0} demo contractors`)

    // Create matches for current user + demo contractors
    const matchesCreated = []
    
    for (const project of createdProjects) {
      // Always create match for current user if they have the right trade
      const { data: currentContractor } = await supabase
        .from('contractors')
        .select('trades')
        .eq('id', user.id)
        .single()
      
      if (currentContractor && currentContractor.trades?.includes(project.gewerk_id)) {
        const { error: matchError } = await supabase
          .from('matches')
          .insert({
            project_id: project.id,
            contractor_id: user.id,
            score: 95,
            match_type: 'DEMO',
            status: 'pending',
            lead_purchased: false
          })
        
        if (!matchError) {
          matchesCreated.push({ project: project.projekt_typ, contractor: 'YOU' })
        }
      }
      
      // Create matches for other contractors
      if (contractors) {
        const matchingContractors = contractors.filter(c => 
          c.id !== user.id && c.trades?.includes(project.gewerk_id)
        )
        
        for (const contractor of matchingContractors.slice(0, 3)) {
          const { error: matchError } = await supabase
            .from('matches')
            .insert({
              project_id: project.id,
              contractor_id: contractor.id,
              score: 80 + Math.floor(Math.random() * 15),
              match_type: 'DEMO',
              status: 'pending',
              lead_purchased: false
            })
          
          if (!matchError) {
            matchesCreated.push({ project: project.projekt_typ, contractor: contractor.company_name })
          }
        }
      }
    }

    console.log('✅ Demo seed complete!')

    return new Response(
      JSON.stringify({
        success: true,
        projectsCreated: createdProjects.length,
        matchesCreated: matchesCreated.length,
        message: `${createdProjects.length} Demo-Leads und ${matchesCreated.length} Matches erstellt!`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Error in seed-demo-leads:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
