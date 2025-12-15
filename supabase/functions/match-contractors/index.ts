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
  customer_id: string
}

interface Contractor {
  id: string
  company_name: string
  trades: string[]
  city: string
  postal_codes: string[]
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
function getCoordinatesFromPostalCode(postalCode: string | null | undefined): { lat: number; lon: number } | null {
  if (!postalCode) return null
  const pergCenter = { lat: 48.2511, lon: 14.6356 }
  const firstDigit = parseInt(postalCode.charAt(0))
  
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
  score -= distance * 0.5
  
  // Quality score bonus
  score += contractor.quality_score * 0.3
  
  // Budget match bonus
  const projectBudget = project.budget_max || project.estimated_value || contractor.min_project_value
  if (projectBudget >= contractor.min_project_value) {
    score += 20
  }
  
  // Urgency handling
  if (project.urgency === 'high' && !contractor.accepts_urgent) {
    score -= 50
  }
  
  return Math.max(0, score)
}

// Calculate lead price
function calculateLeadPrice(
  gewerkConfig: GewerkConfig,
  urgency: string,
  hasPhotos: boolean,
  descriptionLength: number
): number {
  let price = gewerkConfig.base_price
  
  if (urgency === 'high') {
    price += gewerkConfig.urgent_surcharge
  }
  
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

  console.log('🎯 Starting contractor matching...')

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // ============================================================
    // AUTHENTICATION: Support both user JWT and service-to-service calls
    // ============================================================
    const authHeader = req.headers.get('Authorization')
    let authenticatedUserId: string | null = null
    let isServiceCall = false

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '')
      
      // Check if this is the service role key (used by other edge functions)
      if (token === supabaseServiceKey) {
        console.log('✅ Service-to-service call authenticated')
        isServiceCall = true
      } else {
        // Try to validate as user JWT
        try {
          const { data: { user }, error: authError } = await supabase.auth.getUser(token)
          if (!authError && user) {
            authenticatedUserId = user.id
            console.log('✅ User authenticated:', user.id)
          } else {
            console.log('⚠️ JWT validation failed, proceeding as service call')
            isServiceCall = true
          }
        } catch (e) {
          console.log('⚠️ JWT validation error, proceeding as service call')
          isServiceCall = true
        }
      }
    } else {
      // No auth header - allow for internal calls
      console.log('⚠️ No auth header, proceeding as service call')
      isServiceCall = true
    }

    const { projectId } = await req.json()
    
    if (!projectId) {
      return new Response(
        JSON.stringify({ error: 'Missing projectId' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch project (using service role key, so RLS is bypassed)
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single()
    
    if (projectError || !project) {
      console.error('❌ Project not found:', projectError)
      return new Response(
        JSON.stringify({ error: 'Project not found' }), 
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // If user is authenticated, verify ownership
    if (authenticatedUserId && project.customer_id !== authenticatedUserId) {
      console.error('❌ Project ownership mismatch')
      return new Response(
        JSON.stringify({ error: 'Forbidden: You do not own this project' }), 
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    console.log('✅ Project found:', project.id)
    console.log('📋 Project details:', {
      gewerk_id: project.gewerk_id,
      city: project.city,
      urgency: project.urgency
    })

    // Get gewerk pricing config
    const { data: gewerkConfig, error: gewerkError } = await supabase
      .from('gewerke_config')
      .select('*')
      .eq('id', project.gewerk_id)
      .single()

    if (gewerkError || !gewerkConfig) {
      throw new Error(`Gewerk config not found: ${gewerkError?.message}`)
    }

    // Calculate lead price
    const leadPrice = calculateLeadPrice(
      gewerkConfig,
      project.urgency || 'medium',
      (project.images || []).length > 0,
      (project.description || '').length
    )

    console.log('💰 Calculated lead price:', leadPrice, 'EUR')

    // Update project with pricing
    await supabase
      .from('projects')
      .update({
        base_price: gewerkConfig.base_price,
        final_price: leadPrice
      })
      .eq('id', projectId)

    // Get contractors with matching trades
    console.log('🔍 Searching for contractors with gewerk:', project.gewerk_id)
    
    const { data: contractors, error: contractorsError } = await supabase
      .from('contractors')
      .select('*')
      .contains('trades', [project.gewerk_id])
      .in('handwerker_status', ['REGISTERED', 'APPROVED', 'UNDER_REVIEW'])
    
    if (contractorsError) {
      throw new Error(`Failed to fetch contractors: ${contractorsError.message}`)
    }

    console.log(`📋 Found ${contractors?.length || 0} contractors with matching trades`)
    
    if (!contractors || contractors.length === 0) {
      console.log('⚠️ No contractors found with matching trades')
      return new Response(
        JSON.stringify({ 
          success: true, 
          matches: 0, 
          leadPrice,
          message: 'No contractors found with matching trades'
        }), 
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get project coordinates
    const projectCoords = getCoordinatesFromPostalCode(project.postal_code)
    console.log('📍 Project coordinates:', projectCoords)

    // Calculate scores and filter by distance
    const scoredContractors: Array<{ contractor: Contractor; score: number; distance: number }> = []
    
    for (const contractor of contractors) {
      // Get contractor location from postal_codes array
      const contractorPostalCode = contractor.postal_codes?.[0]
      const contractorCoords = getCoordinatesFromPostalCode(contractorPostalCode)
      
      if (!contractorCoords || !projectCoords) {
        // Include anyway with default distance
        scoredContractors.push({
          contractor,
          score: calculateRelevanceScore(contractor, project, 50, leadPrice),
          distance: 50
        })
        continue
      }
      
      const distance = calculateDistance(
        projectCoords.lat,
        projectCoords.lon,
        contractorCoords.lat,
        contractorCoords.lon
      )
      
      // Check if within service radius
      if (distance <= (contractor.service_radius || 150)) {
        const score = calculateRelevanceScore(contractor, project, distance, leadPrice)
        scoredContractors.push({ contractor, score, distance })
      }
    }

    console.log(`📊 ${scoredContractors.length} contractors within service radius`)

    // Sort by score and take top matches
    const topMatches = scoredContractors
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)

    console.log(`🎯 Creating ${topMatches.length} match records`)

    // Create match records
    let matchesCreated = 0
    for (const { contractor, score } of topMatches) {
      try {
        // Check if match already exists
        const { data: existingMatch } = await supabase
          .from('matches')
          .select('id')
          .eq('project_id', projectId)
          .eq('contractor_id', contractor.id)
          .maybeSingle()

        if (existingMatch) {
          console.log(`⏭️ Match already exists for contractor ${contractor.company_name}`)
          continue
        }

        // Create new match
        const { error: matchError } = await supabase
          .from('matches')
          .insert({
            project_id: projectId,
            contractor_id: contractor.id,
            match_type: 'auto',
            score: Math.round(score),
            status: 'pending',
            lead_purchased: false
          })

        if (matchError) {
          console.error(`❌ Failed to create match for ${contractor.company_name}:`, matchError)
          continue
        }

        matchesCreated++
        console.log(`✅ Match created for ${contractor.company_name} (score: ${Math.round(score)})`)

        // Create notification for contractor
        try {
          await supabase
            .from('notifications')
            .insert({
              handwerker_id: contractor.id,
              type: 'new_lead',
              title: `Neuer Auftrag: ${project.title || project.projekt_typ}`,
              body: `Ein neuer ${project.gewerk_id} Auftrag in ${project.city} ist verfügbar.`,
              data: { projectId, leadPrice },
              channels: ['in_app', 'email']
            })
        } catch (notifError) {
          console.error('⚠️ Failed to create notification:', notifError)
        }
      } catch (e) {
        console.error(`❌ Error processing contractor ${contractor.id}:`, e)
      }
    }

    console.log(`✅ Matching complete: ${matchesCreated} matches created`)

    // Trigger email notifications (non-blocking)
    try {
      const emailUrl = `${supabaseUrl}/functions/v1/send-new-lead-notification`
      fetch(emailUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId })
      }).catch(e => console.error('Email notification error:', e))
    } catch (e) {
      console.error('Failed to trigger email notifications:', e)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        matches: matchesCreated,
        leadPrice,
        topContractors: topMatches.slice(0, 5).map(m => ({
          id: m.contractor.id,
          company_name: m.contractor.company_name,
          score: Math.round(m.score)
        }))
      }), 
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('💥 Matching error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: 'Matching failed', details: errorMessage }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
