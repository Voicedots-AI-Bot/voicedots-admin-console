import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://aaqicvweqysgnapftamv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhcWljdndlcXlzZ25hcGZ0YW12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NTYyMjIsImV4cCI6MjA4NzQzMjIyMn0.LKODM4Rf0qBaWPTMbaGxDDtSi9C5v1TA1iWMGVTg9NM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPolicies() {
    console.log("Checking RLS...");

    // Test 1: Try to insert a dummy row to see if it throws an RLS error
    const dummyBlog = {
        title: 'Test RLS Blog ' + Date.now(),
        slug: 'test-rls-' + Date.now(),
        content: '<p>Test</p>',
        published: true,
    };

    console.log("Attempting insert...");
    const { data: insertData, error: insertError } = await supabase.from('blogs').insert([dummyBlog]).select();

    if (insertError) {
        console.error("Insert Error:", insertError.message);
    } else {
        console.log("Insert Success! Data:", insertData);
        // Clean up
        const { error: deleteError } = await supabase.from('blogs').delete().eq('id', insertData[0].id);
        if (deleteError) {
            console.error("Delete Error:", deleteError.message);
        } else {
            console.log("Cleanup Success.");
        }
    }
}

checkPolicies();
