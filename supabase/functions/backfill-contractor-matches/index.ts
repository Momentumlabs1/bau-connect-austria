import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Contractor {
  id: string
  company_name: string
  trades: string[]
  postal_codes: string[]
  service_radius: number
  min_project_value: number
  wallet_balance: number
  handwerker_status: string
  accepts_urgent: boolean
  quality_score: number
}

interface Project {
  id: string
  gewerk_id: string
  city: string
  postal_code: string
  urgency: string
  budget_min?: number
  budget_max?: number
  description: string
  images: string[]
  estimated_value?: number
  final_price: number
}

// Haversine formula to calculate distance
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Austrian postal codes to approximate coordinates
function getCoordinatesFromPostalCode(postalCode: string): { lat: number; lon: number } | null {
  const pergCenter = { lat: 48.2511, lon: 14.6356 }
  const firstDigit = parseInt(postalCode.charAt(0))
  
  const regionOffsets: Record<number, { lat: number; lon: number }> = {
    1: { lat: 48.2082, lon: 16.3738 },
    2: { lat: 48.2, lon: 15.6 },
    3: { lat: 48.2, lon: 15.6 },
    4: { lat: 48.3, lon: 14.3 },
    5: { lat: 47.8, lon: 13.0 },
    6: { lat: 47.3, lon: 11.4 },
    7: { lat: 47.1, lon: 15.4 },
    8: { lat: 47.1, lon: 15.4 },
    9: { lat: 46.6, lon: 14.3 },
  }
  
  return regionOffsets[firstDigit] || pergCenter
}

// Calculate relevance score
function calculateRelevanceScore(
  contractor: Contractor,
  project: Project,
  distance: number
): number {
  let score = 100
  
  score -= distance * 0.5
  score += contractor.quality_score * 0.3
  
  const projectBudget = project.budget_max || project.estimated_value || contractor.min_project_value
  if (projectBudget >= contractor.min_project_value) {
    score += 20
  }
  
  if (project.urgency === 'sofort' && !contractor.accepts_urgent) {
    score -= 50
  }
  
  return Math.max(0, score)
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  console.log('🔄 Starting contractor matches backfill...')

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
      console.error('❌ Invalid token:', authError)
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('✅ Authenticated user:', user.id)

    // Load contractor profile
    const { data: contractor, error: contractorError } = await supabase
      .from('contractors')
      .select('*')
      .eq('id', user.id)
      .single()

    if (contractorError || !contractor) {
      console.error('❌ Contractor not found:', contractorError)
      return new Response(
        JSON.stringify({ error: 'Contractor profile not found' }), 
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('👷 Contractor:', contractor.company_name, 'Trades:', contractor.trades)

    if (!contractor.trades || contractor.trades.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'Keine Gewerke konfiguriert. Bitte vervollständigen Sie Ihr Profil.',
          matchesCreated: 0
        }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Find all open, public projects matching contractor's trades
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .eq('status', 'open')
      .eq('visibility', 'public')
      .in('gewerk_id', contractor.trades)
      .order('created_at', { ascending: false })

    if (projectsError) {
      console.error('❌ Error fetching projects:', projectsError)
      throw new Error(`Error fetching projects: ${projectsError.message}`)
    }

    console.log(`📋 Found ${projects?.length || 0} open projects for contractor's trades`)

    if (!projects || projects.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: 'Keine passenden offenen Projekte gefunden',
          matchesCreated: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get contractor coordinates
    const contractorCoords = contractor.postal_codes && contractor.postal_codes.length > 0
      ? getCoordinatesFromPostalCode(contractor.postal_codes[0])
      : null

    if (!contractorCoords) {
      console.error('❌ Could not geocode contractor location')
      return new Response(
        JSON.stringify({ error: 'Invalid contractor location' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check existing matches
    const { data: existingMatches } = await supabase
      .from('matches')
      .select('project_id')
      .eq('contractor_id', user.id)

    const existingProjectIds = new Set(existingMatches?.map(m => m.project_id) || [])

    // Calculate distances and scores for each project
    const newMatches = []
    
    for (const project of projects) {
      // Skip if match already exists
      if (existingProjectIds.has(project.id)) {
        continue
      }

      const projectCoords = getCoordinatesFromPostalCode(project.postal_code)
      if (!projectCoords) continue

      const distance = calculateDistance(
        contractorCoords.lat,
        contractorCoords.lon,
        projectCoords.lat,
        projectCoords.lon
      )

      // Check if within service radius
      if (distance > contractor.service_radius) {
        continue
      }

      // Check min project value
      const projectValue = project.budget_max || project.estimated_value || 0
      if (projectValue > 0 && projectValue < contractor.min_project_value) {
        continue
      }

      // Check wallet balance
      if (contractor.wallet_balance < project.final_price) {
        continue
      }

      const score = calculateRelevanceScore(contractor, project, distance)
      
      if (score > 0) {
        newMatches.push({
          project_id: project.id,
          contractor_id: user.id,
          score: Math.round(score),
          match_type: 'suggested',
          status: 'pending',
          lead_purchased: false
        })
      }
    }

    console.log(`✨ Creating ${newMatches.length} new matches`)

    if (newMatches.length > 0) {
      const { error: insertError } = await supabase
        .from('matches')
        .insert(newMatches)

      if (insertError) {
        console.error('❌ Error creating matches:', insertError)
        throw new Error(`Error creating matches: ${insertError.message}`)
      }
    }

    console.log('✅ Backfill complete!')

    return new Response(
      JSON.stringify({
        success: true,
        matchesCreated: newMatches.length,
        message: newMatches.length > 0 
          ? `${newMatches.length} neue passende Leads gefunden!`
          : 'Keine neuen Leads in Ihrem Gebiet verfügbar'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Error in backfill-contractor-matches:', error)
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
