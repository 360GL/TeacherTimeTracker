import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://gzuhxqrntgoaagwvfsfj.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6dWh4cXJudGdvYWFnd3Zmc2ZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyOTg5NDgsImV4cCI6MjA2ODg3NDk0OH0.UysP_Wygq6tGcMSTGKutDIS_2RtV-iov300eS9uYmGE"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      activities: {
        Row: {
          id: string
          user_id: string
          type: string
          date: string
          duration: number
          comment: string | null
          is_planned: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          date: string
          duration: number
          comment?: string | null
          is_planned?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          date?: string
          duration?: number
          comment?: string | null
          is_planned?: boolean
          created_at?: string
        }
      }
    }
  }
}
