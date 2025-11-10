import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    // Get authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Get user from token
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    const { leadId } = await req.json()
    console.log('💰 Processing lead purchase:', { leadId, handwerkerId: user.id })

    // 1. Get contractor profile
    const { data: contractor, error: contractorError } = await supabase
      .from('contractors')
      .select('*')
      .eq('id', user.id)
      .single()

    if (contractorError || !contractor) {
      throw new Error('Contractor profile not found')
    }

    // 2. Get lead details
    const { data: lead, error: leadError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', leadId)
      .single()

    if (leadError || !lead) {
      throw new Error('Lead not found')
    }

    const leadPrice = Number(lead.final_price) || 0

    console.log('📊 Lead price:', leadPrice, 'Wallet balance:', contractor.wallet_balance)

    // 3. Check if contractor has enough balance
    if (Number(contractor.wallet_balance) < leadPrice) {
      return new Response(
        JSON.stringify({ 
          error: 'Insufficient balance',
          message: `Ihr Wallet-Guthaben reicht nicht aus. Lead-Preis: €${leadPrice}, Ihr Guthaben: €${contractor.wallet_balance}`,
          requiredAmount: leadPrice,
          currentBalance: contractor.wallet_balance
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // 4. Check if contractor already purchased this lead
    const { data: existingPurchase } = await supabase
      .from('matches')
      .select('*')
      .eq('project_id', leadId)
      .eq('contractor_id', user.id)
      .eq('lead_purchased', true)
      .single()

    if (existingPurchase) {
      return new Response(
        JSON.stringify({
          error: 'Already purchased',
          message: 'Sie haben diesen Lead bereits gekauft',
          leadDetails: lead
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // 5. Check if lead is still available (max 3 contractors)
    const { data: purchases, error: purchasesError } = await supabase
      .from('matches')
      .select('contractor_id')
      .eq('project_id', leadId)
      .eq('lead_purchased', true)

    if (purchasesError) throw purchasesError

    if (purchases && purchases.length >= 3) {
      return new Response(
        JSON.stringify({
          error: 'Lead sold out',
          message: 'Dieser Lead wurde bereits an 3 Handwerker verkauft'
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // 6. Deduct from wallet and update stats
    const newBalance = Number(contractor.wallet_balance) - leadPrice
    
    const { error: updateError } = await supabase
      .from('contractors')
      .update({ 
        wallet_balance: newBalance,
        leads_bought: (contractor.leads_bought || 0) + 1
      })
      .eq('id', user.id)

    if (updateError) throw updateError

    // 7. Create transaction record
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        handwerker_id: user.id,
        lead_id: leadId,
        type: 'LEAD_PURCHASE',
        amount: -leadPrice,
        balance_after: newBalance,
        description: `Lead gekauft: ${lead.projekt_typ || lead.title}`,
        metadata: {
          lead_id: leadId,
          lead_price: leadPrice,
          project_title: lead.projekt_typ || lead.title,
          project_city: lead.city
        }
      })

    if (transactionError) throw transactionError

    // 8. Update match record
    const { error: matchError } = await supabase
      .from('matches')
      .update({
        lead_purchased: true,
        purchased_at: new Date().toISOString(),
        status: 'active'
      })
      .eq('project_id', leadId)
      .eq('contractor_id', user.id)

    if (matchError) {
      console.warn('⚠️ Match record not found, creating new one')
      // Create match if it doesn't exist
      await supabase
        .from('matches')
        .insert({
          project_id: leadId,
          contractor_id: user.id,
          lead_purchased: true,
          purchased_at: new Date().toISOString(),
          status: 'active',
          match_type: 'MANUAL',
          score: 0
        })
    }

    // 9. Mark notification as read
    await supabase
      .from('notifications')
      .update({ read: true, read_at: new Date().toISOString() })
      .eq('handwerker_id', user.id)
      .eq('data->lead_id', leadId)

    console.log('✅ Lead purchased successfully!')

    // 10. Return full lead details
    return new Response(
      JSON.stringify({
        success: true,
        message: `Lead erfolgreich gekauft für €${leadPrice}`,
        newBalance,
        leadDetails: {
          id: lead.id,
          title: lead.title || lead.projekt_typ,
          description: lead.description,
          trade: lead.trade,
          city: lead.city,
          postal_code: lead.postal_code,
          address: lead.address,
          urgency: lead.urgency,
          budget_min: lead.budget_min,
          budget_max: lead.budget_max,
          estimated_value: lead.estimated_value,
          preferred_start_date: lead.preferred_start_date,
          images: lead.images || lead.fotos || [],
          
          // Customer contact (now unlocked!)
          customer: {
            // We'd need to join with profiles table in a real implementation
            // For now return project customer_id
            id: lead.customer_id
          },
          
          purchased_at: new Date().toISOString(),
          price_paid: leadPrice
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('❌ Error in purchase-lead:', error)
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
