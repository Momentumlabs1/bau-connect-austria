import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Project {
  id: string
  gewerk_id: string
  city: string
  postal_code: string
  urgency: 'high' | 'medium' | 'low'
  budget_min?: number
  budget_max?: number
  description: string
  images: string[]
  projekt_typ: string
  estimated_value?: number
}

interface Contractor {
  id: string
  company_name: string
  trades: string[]
  city: string
  postal_code: string
  service_radius: number
  min_project_value: number
  wallet_balance: number
  handwerker_status: string
  accepts_urgent: boolean
  quality_score: number
}

interface GewerkConfig {
  id: string
  base_price: number
  urgent_surcharge: number
  min_project_value: number
}

// Haversine formula to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Simplified geocoding - Austrian postal codes to approximate coordinates
// This is a basic implementation - in production you'd use a real geocoding API
function getCoordinatesFromPostalCode(postalCode: string): { lat: number; lon: number } | null {
  // Perg center coordinates
  const pergCenter = { lat: 48.2511, lon: 14.6356 }
  
  // Very simplified: use first digit to approximate region
  const firstDigit = parseInt(postalCode.charAt(0))
  
  // Rough approximation of Austrian regions
  const regionOffsets: Record<number, { lat: number; lon: number }> = {
    1: { lat: 48.2082, lon: 16.3738 }, // Vienna
    2: { lat: 48.2, lon: 15.6 }, // Lower Austria
    3: { lat: 48.2, lon: 15.6 }, // Lower Austria
    4: { lat: 48.3, lon: 14.3 }, // Upper Austria (including Perg)
    5: { lat: 47.8, lon: 13.0 }, // Salzburg
    6: { lat: 47.3, lon: 11.4 }, // Tyrol
    7: { lat: 47.1, lon: 15.4 }, // Styria
    8: { lat: 47.1, lon: 15.4 }, // Styria
    9: { lat: 46.6, lon: 14.3 }, // Carinthia
  }
  
  return regionOffsets[firstDigit] || pergCenter
}

// Calculate relevance score for matching
function calculateRelevanceScore(
  contractor: Contractor,
  project: Project,
  distance: number,
  leadPrice: number
): number {
  let score = 100
  
  // Distance penalty (closer is better)
  score -= distance * 0.5 // -0.5 points per km
  
  // Quality score bonus
  score += contractor.quality_score * 0.3 // Up to +30 points for quality 100
  
  // Wallet balance check (can they afford it?)
  if (contractor.wallet_balance < leadPrice) {
    return 0 // Can't match if they can't afford it
  }
  
  // Budget match bonus
  const projectBudget = project.budget_max || project.estimated_value || contractor.min_project_value
  if (projectBudget >= contractor.min_project_value) {
    score += 20
  }
  
  // Urgency handling
  if (project.urgency === 'high' && !contractor.accepts_urgent) {
    score -= 50 // Big penalty for urgent projects if contractor doesn't accept them
  }
  
  return Math.max(0, score)
}

// Calculate lead price based on gewerk and urgency
function calculateLeadPrice(
  gewerkConfig: GewerkConfig,
  urgency: string,
  hasPhotos: boolean,
  descriptionLength: number
): number {
  let price = gewerkConfig.base_price
  
  // Urgency surcharge
  if (urgency === 'high') {
    price += gewerkConfig.urgent_surcharge
  }
  
  // Quality bonus for detailed leads
  if (hasPhotos && descriptionLength > 200) {
    price += 5
  }
  
  return price
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { projectId } = await req.json()
    console.log('🔍 Starting contractor matching for project:', projectId)

    // 1. Get project details
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single()

    if (projectError || !project) {
      throw new Error(`Project not found: ${projectError?.message}`)
    }

    console.log('📋 Project details:', {
      gewerk_id: project.gewerk_id,
      city: project.city,
      urgency: project.urgency
    })

    // 2. Get gewerk pricing config
    const { data: gewerkConfig, error: gewerkError } = await supabase
      .from('gewerke_config')
      .select('*')
      .eq('id', project.gewerk_id)
      .single()

    if (gewerkError || !gewerkConfig) {
      throw new Error(`Gewerk config not found: ${gewerkError?.message}`)
    }

    // 3. Calculate lead price
    const leadPrice = calculateLeadPrice(
      gewerkConfig,
      project.urgency || 'medium',
      (project.images || []).length > 0,
      (project.description || '').length
    )

    console.log('💰 Calculated lead price:', leadPrice, 'EUR')

    // 4. Update project with pricing
    await supabase
      .from('projects')
      .update({
        base_price: gewerkConfig.base_price,
        final_price: leadPrice
      })
      .eq('id', projectId)

    // 5. Find matching contractors
    const { data: contractors, error: contractorsError } = await supabase
      .from('contractors')
      .select('*')
      .contains('trades', [project.gewerk_id])
      .eq('handwerker_status', 'APPROVED')
      .gte('wallet_balance', leadPrice)

    if (contractorsError) {
      throw new Error(`Error fetching contractors: ${contractorsError.message}`)
    }

    console.log('👷 Found', contractors?.length || 0, 'potential contractors')

    if (!contractors || contractors.length === 0) {
      console.log('⚠️ No matching contractors found')
      return new Response(
        JSON.stringify({ 
          success: true, 
          matches: 0,
          message: 'No contractors available at the moment'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 6. Calculate distances and scores
    const projectCoords = getCoordinatesFromPostalCode(project.postal_code)
    
    if (!projectCoords) {
      console.error('❌ Could not geocode project location')
      throw new Error('Invalid project location')
    }

    const scoredContractors = contractors
      .map(contractor => {
        const contractorCoords = getCoordinatesFromPostalCode(contractor.postal_code)
        if (!contractorCoords) return null

        const distance = calculateDistance(
          projectCoords.lat,
          projectCoords.lon,
          contractorCoords.lat,
          contractorCoords.lon
        )

        // Check if within service radius
        if (distance > contractor.service_radius) {
          return null
        }

        // Check min project value
        const projectValue = project.budget_max || project.estimated_value || 0
        if (projectValue > 0 && projectValue < contractor.min_project_value) {
          return null
        }

        const score = calculateRelevanceScore(contractor, project, distance, leadPrice)
        
        return {
          contractor,
          distance,
          score
        }
      })
      .filter(Boolean)
      .filter(match => match!.score > 0)
      .sort((a, b) => b!.score - a!.score)

    console.log('✅ Matched contractors:', scoredContractors.length)

    // 7. Take top 5 contractors
    const topMatches = scoredContractors.slice(0, 5)

    // 8. Create notifications for matched contractors
    const notifications = topMatches.map(match => ({
      handwerker_id: match!.contractor.id,
      type: 'NEW_LEAD_AVAILABLE',
      title: `Neuer ${project.gewerk_id} Auftrag in ${project.city}`,
      body: `${project.projekt_typ || 'Projekt'} - Geschätzter Wert: €${project.estimated_value || project.budget_max || 'k.A.'} - Lead-Preis: €${leadPrice}`,
      data: {
        lead_id: projectId,
        lead_price: leadPrice,
        distance: Math.round(match!.distance),
        match_score: Math.round(match!.score),
        urgency: project.urgency,
        city: project.city,
        postal_code_partial: project.postal_code.substring(0, 2) + '**'
      },
      channels: ['email', 'push'],
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    }))

    if (notifications.length > 0) {
      const { error: notifError } = await supabase
        .from('notifications')
        .insert(notifications)

      if (notifError) {
        console.error('❌ Error creating notifications:', notifError)
      } else {
        console.log('📬 Created', notifications.length, 'notifications')
      }
    }

    // 9. Create match records
    const matches = topMatches.map(match => ({
      project_id: projectId,
      contractor_id: match!.contractor.id,
      score: Math.round(match!.score),
      match_type: 'AUTO',
      status: 'pending',
      lead_purchased: false
    }))

    if (matches.length > 0) {
      const { error: matchError } = await supabase
        .from('matches')
        .insert(matches)

      if (matchError) {
        console.error('❌ Error creating matches:', matchError)
      } else {
        console.log('🎯 Created', matches.length, 'match records')
      }
    }

    console.log('✅ Matching complete!')

    return new Response(
      JSON.stringify({
        success: true,
        matches: topMatches.length,
        leadPrice,
        contractors: topMatches.map(m => ({
          id: m!.contractor.id,
          company_name: m!.contractor.company_name,
          distance: Math.round(m!.distance),
          score: Math.round(m!.score)
        }))
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Error in match-contractors:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
