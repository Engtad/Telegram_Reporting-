import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    console.log('🔄 Starting daily limits reset...');

    // Reset all user daily limits in Supabase
    const { error } = await supabase
      .from('daily_limits')
      .update({ 
        requests_today: 0,
        last_reset: new Date().toISOString()
      })
      .neq('user_id', ''); // Update all rows

    if (error) {
      console.error('❌ Error resetting limits:', error);
      return res.status(500).json({ error: error.message });
    }

    console.log('✅ Daily limits reset successfully');
    return res.status(200).json({ 
      message: 'Daily limits reset successfully',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('💥 Cron job error:', err);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: err instanceof Error ? err.message : 'Unknown error'
    });
  }
}
