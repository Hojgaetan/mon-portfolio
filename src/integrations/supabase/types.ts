export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          created_at: string
          title: string
          description: string | null
          image_url: string | null
          project_url: string | null
          github_url: string | null
          technologies: string[] | null
          featured: boolean | null
          planning_url: string | null
          modelisation_url: string | null
          charte_url: string | null
          prototype_url: string | null
          category: "personnel" | "professionnel" | "academique"
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          description?: string | null
          image_url?: string | null
          project_url?: string | null
          github_url?: string | null
          technologies?: string[] | null
          featured?: boolean | null
          planning_url?: string | null
          modelisation_url?: string | null
          charte_url?: string | null
          prototype_url?: string | null
          category: "personnel" | "professionnel" | "academique"
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          description?: string | null
          image_url?: string | null
          project_url?: string | null
          github_url?: string | null
          technologies?: string[] | null
          featured?: boolean | null
          planning_url?: string | null
          modelisation_url?: string | null
          charte_url?: string | null
          prototype_url?: string | null
          category?: "personnel" | "professionnel" | "academique"
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

