import { createClient } from "npm:@supabase/supabase-js@2";

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

    // 3.5. Check if a match exists for this contractor-project pair
    console.log('🔍 Checking if match exists...')
    let { data: matchRecord, error: matchCheckError } = await supabase
      .from('matches')
      .select('*')
      .eq('project_id', leadId)
      .eq('contractor_id', user.id)
      .maybeSingle()

    if (matchCheckError) {
      console.error('❌ Error checking match:', matchCheckError)
      throw matchCheckError
    }

    if (!matchRecord) {
      console.log('📝 No match found - creating one automatically...')
      // Handwerker will kaufen = Handwerker ist interessiert = Match erstellen!
      const { data: newMatch, error: createMatchError } = await supabase
        .from('matches')
        .insert({
          project_id: leadId,
          contractor_id: user.id,
          match_type: 'applied',
          score: 50,
          status: 'pending',
          created_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (createMatchError) {
        console.error('❌ Failed to create match:', createMatchError)
        throw new Error('Could not process lead purchase')
      }
      
      console.log('✅ Auto-match created:', newMatch.id)
      matchRecord = newMatch  // Use the new match for further processing
    }
 
    console.log('✅ Match exists:', matchRecord.id)
 
    // 4. Check if contractor already purchased this lead
    if (matchRecord.lead_purchased === true) {
      console.warn('⚠️ Lead already purchased')
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
 
    // 8. Update match record with UPSERT
    console.log('📝 Updating match record with UPSERT...')
    const { data: updatedMatch, error: matchError } = await supabase
      .from('matches')
      .upsert({
        project_id: leadId,
        contractor_id: user.id,
        lead_purchased: true,
        purchased_at: new Date().toISOString(),
        status: 'contacted',
        match_type: matchRecord?.match_type || 'applied',
        score: matchRecord?.score || 0
      }, {
        onConflict: 'project_id,contractor_id'
      })
      .select()
      .single()
 
    if (matchError) {
      console.error('❌ Failed to update match:', matchError)
      throw matchError
    }
 
    console.log('✅ Match updated successfully:', updatedMatch)
 
    // 9. Mark notification as read
    await supabase
      .from('notifications')
      .update({ read: true, read_at: new Date().toISOString() })
      .eq('handwerker_id', user.id)
      .eq('data->lead_id', leadId)

    // 10. Create conversation automatically
    console.log('💬 Creating conversation...')
    const { data: existingConv } = await supabase
      .from('conversations')
      .select('id')
      .eq('contractor_id', user.id)
      .eq('customer_id', lead.customer_id)
      .eq('project_id', leadId)
      .maybeSingle()

    let conversationId = existingConv?.id

    if (!conversationId) {
      const { data: newConv, error: convError } = await supabase
        .from('conversations')
        .insert({
          contractor_id: user.id,
          customer_id: lead.customer_id,
          project_id: leadId,
          last_message_at: new Date().toISOString()
        })
        .select('id')
        .single()

      if (!convError && newConv) {
        conversationId = newConv.id
        console.log('✅ Conversation created:', conversationId)
        // NO automatic message - contractor will write their own message
      }
    }

    console.log('✅ Lead purchased successfully!')

    // 11. Get customer details - WICHTIG: Service Role Key umgeht RLS!
    console.log('👤 Fetching customer details for customer_id:', lead.customer_id)
    const { data: customerProfile, error: customerError } = await supabase
      .from('profiles')
      .select('first_name, last_name, email, phone')
      .eq('id', lead.customer_id)
      .single()

    console.log('👤 Customer profile result:', { customerProfile, customerError })

    if (customerError) {
      console.error('❌ Could not fetch customer profile:', customerError)
    }

    // 12. Send email confirmation to contractor
    console.log('📧 Sending lead purchase confirmation email...')
    try {
      const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-lead-purchase-confirmation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({
          contractorId: user.id,
          leadId: leadId,
          pricePaid: leadPrice
        })
      })
      const emailResult = await emailResponse.json()
      console.log('📧 Email result:', emailResult)
    } catch (emailError) {
      console.error('⚠️ Failed to send email confirmation (non-blocking):', emailError)
      // Don't throw - email is nice to have but not critical
    }

    // 12. Return full lead details with customer info
    return new Response(
      JSON.stringify({
        success: true,
        message: `Lead erfolgreich gekauft für €${leadPrice}`,
        newBalance,
        conversationId,
        leadDetails: {
          id: lead.id,
          title: lead.title || lead.projekt_typ,
          description: lead.description,
          gewerk_id: lead.gewerk_id,
          city: lead.city,
          postal_code: lead.postal_code,
          address: lead.address,
          urgency: lead.urgency,
          budget_min: lead.budget_min,
          budget_max: lead.budget_max,
          estimated_value: lead.estimated_value,
          preferred_start_date: lead.preferred_start_date,
          images: lead.images || lead.fotos || [],
          purchased_at: new Date().toISOString(),
          price_paid: leadPrice
        },
        customerDetails: customerProfile || { email: 'Nicht verfügbar' }
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
