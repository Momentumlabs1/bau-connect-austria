import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Starting cleanup of all auth users...')
    
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Get all users from auth.users
    const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (listError) {
      console.error('Error listing users:', listError)
      throw listError
    }

    console.log(`Found ${usersData.users.length} users to delete`)

    const deletedUsers: string[] = []
    const failedUsers: string[] = []
    
    // Delete each user
    for (const user of usersData.users) {
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id)
      
      if (deleteError) {
        console.error(`Failed to delete user ${user.email}:`, deleteError)
        failedUsers.push(user.email || user.id)
      } else {
        console.log(`✅ Deleted user: ${user.email}`)
        deletedUsers.push(user.email || user.id)
      }
    }

    console.log(`Cleanup complete. Deleted: ${deletedUsers.length}, Failed: ${failedUsers.length}`)

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Deleted ${deletedUsers.length} users`,
        deletedUsers,
        failedUsers
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error:', errorMessage)
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
