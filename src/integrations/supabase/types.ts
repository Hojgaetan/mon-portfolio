export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      about_sections: {
        Row: {
          content: Json
          created_at: string | null
          icon_name: string | null
          id: string
          is_active: boolean | null
          order_index: number | null
          section_key: string
          section_type: string
          title: string
          updated_at: string | null
        }
        Insert: {
          content: Json
          created_at?: string | null
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          order_index?: number | null
          section_key: string
          section_type: string
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: Json
          created_at?: string | null
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          order_index?: number | null
          section_key?: string
          section_type?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      access_pass: {
        Row: {
          amount: number
          created_at: string
          currency: string
          expires_at: string
          id: string
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          expires_at: string
          id?: string
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          expires_at?: string
          id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "access_pass_user_id_fkey_profiles"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      admins: {
        Row: {
          created_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          user_id?: string
        }
        Relationships: []
      }
      article_comments: {
        Row: {
          approved: boolean | null
          article_id: string
          author_email: string
          author_name: string
          client_id: string | null
          content: string
          created_at: string | null
          id: string
          ip_address: unknown
          updated_at: string | null
        }
        Insert: {
          approved?: boolean | null
          article_id: string
          author_email: string
          author_name: string
          client_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          updated_at?: string | null
        }
        Update: {
          approved?: boolean | null
          article_id?: string
          author_email?: string
          author_name?: string
          client_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "article_comments_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      article_likes: {
        Row: {
          active: boolean
          article_id: string
          client_id: string | null
          created_at: string | null
          id: string
          ip_address: unknown
          updated_at: string
        }
        Insert: {
          active?: boolean
          article_id: string
          client_id?: string | null
          created_at?: string | null
          id?: string
          ip_address: unknown
          updated_at?: string
        }
        Update: {
          active?: boolean
          article_id?: string
          client_id?: string | null
          created_at?: string | null
          id?: string
          ip_address?: unknown
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_likes_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      article_shares: {
        Row: {
          article_id: string
          client_id: string | null
          created_at: string | null
          id: string
          ip_address: unknown
          platform: string
        }
        Insert: {
          article_id: string
          client_id?: string | null
          created_at?: string | null
          id?: string
          ip_address?: unknown
          platform: string
        }
        Update: {
          article_id?: string
          client_id?: string | null
          created_at?: string | null
          id?: string
          ip_address?: unknown
          platform?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_shares_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      article_views: {
        Row: {
          article_id: string
          created_at: string | null
          id: string
          ip_address: string | null
          user_agent: string | null
        }
        Insert: {
          article_id: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          user_agent?: string | null
        }
        Update: {
          article_id?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "article_views_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          category_id: string | null
          content: string
          created_at: string | null
          excerpt: string | null
          id: string
          image_url: string | null
          published: boolean | null
          slug: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          content: string
          created_at?: string | null
          excerpt?: string | null
          id?: string
          image_url?: string | null
          published?: boolean | null
          slug?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          content?: string
          created_at?: string | null
          excerpt?: string | null
          id?: string
          image_url?: string | null
          published?: boolean | null
          slug?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      categorie: {
        Row: {
          created_at: string
          description: string | null
          id: string
          nom: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          nom: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          nom?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      certification_skills: {
        Row: {
          color_class: string | null
          created_at: string
          icon: string | null
          id: string
          is_active: boolean
          label: string
          locale: string
          order_index: number
          updated_at: string
        }
        Insert: {
          color_class?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          label: string
          locale: string
          order_index?: number
          updated_at?: string
        }
        Update: {
          color_class?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          label?: string
          locale?: string
          order_index?: number
          updated_at?: string
        }
        Relationships: []
      }
      certifications: {
        Row: {
          created_at: string
          expected: string | null
          id: string
          is_active: boolean
          locale: string
          order_index: number
          progress: string | null
          provider: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          expected?: string | null
          id?: string
          is_active?: boolean
          locale: string
          order_index?: number
          progress?: string | null
          provider: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          expected?: string | null
          id?: string
          is_active?: boolean
          locale?: string
          order_index?: number
          progress?: string | null
          provider?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      comment_reactions: {
        Row: {
          active: boolean
          client_id: string | null
          comment_id: string
          created_at: string | null
          id: string
          ip_address: unknown
          reaction_type: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean
          client_id?: string | null
          comment_id: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          reaction_type?: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean
          client_id?: string | null
          comment_id?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          reaction_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string | null
          email: string
          id: string
          ip_address: unknown
          message: string
          name: string
          read: boolean | null
          replied: boolean | null
          updated_at: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          ip_address?: unknown
          message: string
          name: string
          read?: boolean | null
          replied?: boolean | null
          updated_at?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          ip_address?: unknown
          message?: string
          name?: string
          read?: boolean | null
          replied?: boolean | null
          updated_at?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      education_cursus: {
        Row: {
          courses: Json
          created_at: string
          graduation_date: string
          graduation_title: string
          id: string
          institution: string
          is_active: boolean
          locale: string
          program: string
          specialization_desc: string
          specialization_title: string
          status_label: string
          updated_at: string
          year_label: string
        }
        Insert: {
          courses?: Json
          created_at?: string
          graduation_date: string
          graduation_title: string
          id?: string
          institution: string
          is_active?: boolean
          locale: string
          program: string
          specialization_desc: string
          specialization_title: string
          status_label: string
          updated_at?: string
          year_label: string
        }
        Update: {
          courses?: Json
          created_at?: string
          graduation_date?: string
          graduation_title?: string
          id?: string
          institution?: string
          is_active?: boolean
          locale?: string
          program?: string
          specialization_desc?: string
          specialization_title?: string
          status_label?: string
          updated_at?: string
          year_label?: string
        }
        Relationships: []
      }
      entreprise: {
        Row: {
          adresse: string | null
          categorie_id: string | null
          created_at: string
          id: string
          nom: string
          site_web: string | null
          site_web_valide: boolean | null
          telephone: string | null
          updated_at: string
        }
        Insert: {
          adresse?: string | null
          categorie_id?: string | null
          created_at?: string
          id?: string
          nom: string
          site_web?: string | null
          site_web_valide?: boolean | null
          telephone?: string | null
          updated_at?: string
        }
        Update: {
          adresse?: string | null
          categorie_id?: string | null
          created_at?: string
          id?: string
          nom?: string
          site_web?: string | null
          site_web_valide?: boolean | null
          telephone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "entreprise_categorie_id_fkey"
            columns: ["categorie_id"]
            isOneToOne: false
            referencedRelation: "categorie"
            referencedColumns: ["id"]
          },
        ]
      }
      entreprise_view: {
        Row: {
          created_at: string
          entreprise_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          entreprise_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          entreprise_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "entreprise_view_entreprise_id_fkey"
            columns: ["entreprise_id"]
            isOneToOne: false
            referencedRelation: "entreprise"
            referencedColumns: ["id"]
          },
        ]
      }
      export_usage: {
        Row: {
          created_at: string
          id: string
          kind: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          user_id?: string
        }
        Relationships: []
      }
      home_sections_meta: {
        Row: {
          badge: string | null
          created_at: string
          id: string
          is_active: boolean
          locale: string
          section_key: string
          subtitle: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          badge?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          locale: string
          section_key: string
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          badge?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          locale?: string
          section_key?: string
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          city: string | null
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          profession: string | null
          updated_at: string
          user_id: string
          user_type: string
        }
        Insert: {
          city?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          profession?: string | null
          updated_at?: string
          user_id: string
          user_type?: string
        }
        Update: {
          city?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          profession?: string | null
          updated_at?: string
          user_id?: string
          user_type?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          analysis_url: string | null
          category: string | null
          content: string | null
          created_at: string | null
          description: string | null
          design_url: string | null
          featured: boolean | null
          github_url: string | null
          id: string
          image_url: string | null
          planning_url: string | null
          project_url: string | null
          prototype_url: string | null
          slug: string | null
          technologies: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          analysis_url?: string | null
          category?: string | null
          content?: string | null
          created_at?: string | null
          description?: string | null
          design_url?: string | null
          featured?: boolean | null
          github_url?: string | null
          id?: string
          image_url?: string | null
          planning_url?: string | null
          project_url?: string | null
          prototype_url?: string | null
          slug?: string | null
          technologies?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          analysis_url?: string | null
          category?: string | null
          content?: string | null
          created_at?: string | null
          description?: string | null
          design_url?: string | null
          featured?: boolean | null
          github_url?: string | null
          id?: string
          image_url?: string | null
          planning_url?: string | null
          project_url?: string | null
          prototype_url?: string | null
          slug?: string | null
          technologies?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: { user_id: string }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
