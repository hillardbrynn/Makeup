import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic'; // No caching

export async function GET() {
  try {
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Supabase environment variables are not set' },
        { status: 500 }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('Fetching blush embeddings from Supabase...');
    
    // Fetch all blush embeddings
    const { data, error } = await supabase
      .from('blush_embeddings')
      .select('blush_id, embedding');
    
    if (error) {
      console.error('Error fetching blush embeddings:', error);
      return NextResponse.json(
        { error: 'Failed to fetch blush embeddings' },
        { status: 500 }
      );
    }
    
    // Check if embeddings are being returned correctly
    if (data && data.length > 0) {
      console.log(`Retrieved ${data.length} embeddings`);
      console.log(`Sample embedding for blush_id ${data[0].blush_id}: ${data[0].embedding.length} dimensions`);
    } else {
      console.log('No embeddings found');
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Unexpected error in blush embeddings API route:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}