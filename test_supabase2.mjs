import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://aaqicvweqysgnapftamv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhcWljdndlcXlzZ25hcGZ0YW12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NTYyMjIsImV4cCI6MjA4NzQzMjIyMn0.LKODM4Rf0qBaWPTMbaGxDDtSi9C5v1TA1iWMGVTg9NM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    console.log("Testing specific columns...");
    const { data, error } = await supabase.from('blogs').select('id, title, slug, published, created_at');
    if (error) {
        console.error("Error with specific columns:", error);
    } else {
        console.log("Success with specific columns, length:", data.length);
    }
}

test();
