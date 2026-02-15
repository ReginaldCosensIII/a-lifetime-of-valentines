const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const testEmail = process.env.TEST_EMAIL || `test_${Date.now()}@example.com`;
const testPassword = 'password123';

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase URL or Key in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runDebug() {
    console.log('🔍 Starting Deep Debug of send-invite...');

    // 1. Sign Up / Sign In
    console.log(`\n1. Authenticating as ${testEmail}...`);
    let { data: { user }, error: authError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
    });

    if (authError) {
        // If user exists, try login
        console.log('   User exists, logging in...');
        const { data: { user: loginUser }, error: loginError } = await supabase.auth.signInWithPassword({
            email: testEmail,
            password: testPassword,
        });
        if (loginError) {
            console.error('❌ Auth Failed:', loginError.message);
            return;
        }
        user = loginUser;
    }

    if (!user) {
        console.error('❌ Could not get user.');
        return;
    }
    console.log('✅ Authenticated. User ID:', user.id);

    // Get Session Token
    const { data: { session } } = await supabase.auth.getSession();
    console.log('✅ Session Token obtained.');

    // 2. Invoke Function
    console.log('\n2. Invoking send-invite Function...');
    const payload = {
        coupleId: 'DEBUG-COUPLE-ID',
        valentinePlans: 'Debug Test Plans',
        partner_email: 'antigravity_test_partner@gmail.com', // Changed to valid domain to pass DNS check
        invite_code: 'DEBUG1',
        temp_password: 'debugpassword'
    };

    console.log('   Payload:', payload);

    const start = Date.now();
    const { data, error } = await supabase.functions.invoke('send-invite', {
        body: payload,
        headers: {
            Authorization: `Bearer ${session.access_token}`
        }
    });
    const duration = Date.now() - start;

    if (error) {
        console.error(`\n❌ FUNCTION FAILED (${duration}ms)`);
        console.error('   Status:', error.status); // might be undefined if not http error
        console.error('   Message:', error.message);

        if (error.context && typeof error.context.text === 'function') {
            try {
                const bodyText = await error.context.text();
                console.error('   Response Body (Text):', bodyText);
                try {
                    const bodyJson = JSON.parse(bodyText);
                    console.error('   Response Body (JSON):', bodyJson);
                } catch (e) {
                    // ignore
                }
            } catch (readError) {
                console.error('   Could not read response body:', readError);
            }
        }

        if (error.message?.includes('401')) {
            console.log('\n💡 DIAGNOSIS: 401 UNAUTHORIZED');
            console.log('   - The function rejected the token, OR');
            console.log('   - The function is not receiving the Authorization header, OR');
            console.log('   - Project RLS/Auth settings are blocking it.');
        }
    } else {
        console.log(`\n✅ FUNCTION SUCCESS (${duration}ms)`);
        console.log('   Response:', data);
    }
}

runDebug();
