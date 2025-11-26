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

    const { leadId, voucherCode } = await req.json()
    console.log('💰 Processing lead purchase:', { leadId, handwerkerId: user.id, voucherCode })

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

    let leadPrice = Number(lead.final_price) || 0
    let voucherApplied = false

    // 2.5. Check voucher code if provided
    if (voucherCode) {
      console.log('🎟️ Checking voucher code:', voucherCode)
      const { data: promoCode, error: promoError } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', voucherCode.toUpperCase())
        .eq('active', true)
        .single()

      if (!promoError && promoCode) {
        // Check if voucher is valid
        const now = new Date()
        const validFrom = promoCode.valid_from ? new Date(promoCode.valid_from) : null
        const validUntil = promoCode.valid_until ? new Date(promoCode.valid_until) : null

        if ((!validFrom || now >= validFrom) && (!validUntil || now <= validUntil)) {
          // Check usage limits
          if (!promoCode.max_uses || promoCode.used_count < promoCode.max_uses) {
            // Apply discount
            if (promoCode.discount_type === 'fixed') {
              leadPrice = Math.max(0, leadPrice - promoCode.discount_value)
            } else if (promoCode.discount_type === 'percentage') {
              leadPrice = leadPrice * (1 - promoCode.discount_value / 100)
            }
            voucherApplied = true
            console.log('✅ Voucher applied! New price:', leadPrice)

            // Increment usage count
            await supabase
              .from('promo_codes')
              .update({ used_count: promoCode.used_count + 1 })
              .eq('id', promoCode.id)
          } else {
            console.warn('⚠️ Voucher usage limit reached')
          }
        } else {
          console.warn('⚠️ Voucher not valid at this time')
        }
      } else {
        console.warn('⚠️ Voucher not found or inactive')
      }
    }

    console.log('📊 Final lead price:', leadPrice, 'Wallet balance:', contractor.wallet_balance)

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
    const { data: matchRecord, error: matchCheckError } = await supabase
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
      console.warn('⚠️ No match found for this contractor-project pair')
      return new Response(
        JSON.stringify({
          error: 'No match found',
          message: 'Sie können nur Leads kaufen, die Ihnen zugewiesen wurden.',
          hint: 'Dieser Lead wurde Ihnen nicht angezeigt oder ist nicht mehr verfügbar.'
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
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

        // Send automatic welcome message from contractor
        await supabase
          .from('messages')
          .insert({
            conversation_id: conversationId,
            sender_id: user.id,
            message: `Guten Tag! Ich habe großes Interesse an Ihrem Projekt "${lead.title || lead.projekt_typ}" in ${lead.city}. Ich würde mich freuen, Ihnen ein detailliertes Angebot zu erstellen. Könnten wir einen Termin für eine Besichtigung vor Ort vereinbaren?`,
            read: false
          })
      }
    }

    console.log('✅ Lead purchased successfully!')

    // 11. Return full lead details
    return new Response(
      JSON.stringify({
        success: true,
        message: voucherApplied 
          ? `Lead erfolgreich mit Gutschein gekauft! Gespart: €${(Number(lead.final_price) - leadPrice).toFixed(2)}`
          : `Lead erfolgreich gekauft für €${leadPrice}`,
        newBalance,
        voucherApplied,
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
