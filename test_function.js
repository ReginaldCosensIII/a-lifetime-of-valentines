
const supabaseUrl = 'https://sktlokoxmsmmlpyxhzdm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrdGxva294bXNtbWxweXhoemRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwMzI0MzcsImV4cCI6MjA4NjYwODQzN30.Z-Z7taktk2Eo7oGIQoHYIIKZUeydrZTJ7IziXkCE56U';

async function testFunction() {
    console.log("Testing Edge Function via fetch...");

    try {
        const response = await fetch(`${supabaseUrl}/functions/v1/send-invite`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${supabaseKey}`
            },
            body: JSON.stringify({
                partner_email: "cosensreggie@gmail.com", // Use a real looking email
                invite_code: "TESTCODE",
                temp_password: "testpassword",
                valentine_plans: "Testing from Node script"
            })
        });

        console.log(`Status Code: ${response.status}`);
        const text = await response.text();
        console.log("Response Body:", text);

    } catch (error) {
        console.error("Fetch Error:", error);
    }
}

testFunction();
