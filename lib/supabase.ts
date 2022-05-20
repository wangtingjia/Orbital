import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://xxrlnzbivdzmaydspies.supabase.co"
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4cmxuemJpdmR6bWF5ZHNwaWVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NTI1MTgxMjAsImV4cCI6MTk2ODA5NDEyMH0.Wm1zxIBggZbI15QdhzZypniR5Y3ff9mD7CNJP15mvs8'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  localStorage: AsyncStorage as any,
  autoRefreshToken: true,
  persistSession: true,
  detectSessionInUrl: false,
});