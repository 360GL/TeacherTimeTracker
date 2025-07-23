import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

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
