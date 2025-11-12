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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      category_questions: {
        Row: {
          category_id: string
          conditional_logic: Json | null
          created_at: string | null
          help_text: string | null
          id: string
          options: Json | null
          question_text: string
          question_type: string
          required: boolean | null
          sort_order: number | null
          validation_rules: Json | null
        }
        Insert: {
          category_id: string
          conditional_logic?: Json | null
          created_at?: string | null
          help_text?: string | null
          id?: string
          options?: Json | null
          question_text: string
          question_type: string
          required?: boolean | null
          sort_order?: number | null
          validation_rules?: Json | null
        }
        Update: {
          category_id?: string
          conditional_logic?: Json | null
          created_at?: string | null
          help_text?: string | null
          id?: string
          options?: Json | null
          question_text?: string
          question_type?: string
          required?: boolean | null
          sort_order?: number | null
          validation_rules?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "category_questions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      contractors: {
        Row: {
          accepts_urgent: boolean | null
          address: string | null
          auto_recharge_amount: number | null
          auto_recharge_enabled: boolean | null
          auto_recharge_threshold: number | null
          availability_status: string | null
          avg_response_time_minutes: number | null
          capacity_per_month: number | null
          city: string | null
          company_name: string
          conversion_rate: number | null
          created_at: string
          description: string | null
          firmenname: string | null
          free_leads_remaining: number | null
          gewerbeschein_url: string | null
          handwerker_status:
            | Database["public"]["Enums"]["handwerker_status"]
            | null
          id: string
          last_login: string | null
          leads_bought: number | null
          leads_won: number | null
          min_project_value: number | null
          portfolio_images: string[] | null
          postal_codes: string[]
          profile_image_url: string | null
          quality_score: number | null
          rating: number | null
          rechtsform: string | null
          service_radius: number | null
          subscription_tier: string | null
          team_size: number | null
          total_reviews: number | null
          trades: string[]
          uid_nummer: string | null
          updated_at: string
          verified: boolean | null
          versicherung_url: string | null
          wallet_balance: number | null
          website: string | null
          zertifikate_urls: string[] | null
        }
        Insert: {
          accepts_urgent?: boolean | null
          address?: string | null
          auto_recharge_amount?: number | null
          auto_recharge_enabled?: boolean | null
          auto_recharge_threshold?: number | null
          availability_status?: string | null
          avg_response_time_minutes?: number | null
          capacity_per_month?: number | null
          city?: string | null
          company_name: string
          conversion_rate?: number | null
          created_at?: string
          description?: string | null
          firmenname?: string | null
          free_leads_remaining?: number | null
          gewerbeschein_url?: string | null
          handwerker_status?:
            | Database["public"]["Enums"]["handwerker_status"]
            | null
          id: string
          last_login?: string | null
          leads_bought?: number | null
          leads_won?: number | null
          min_project_value?: number | null
          portfolio_images?: string[] | null
          postal_codes?: string[]
          profile_image_url?: string | null
          quality_score?: number | null
          rating?: number | null
          rechtsform?: string | null
          service_radius?: number | null
          subscription_tier?: string | null
          team_size?: number | null
          total_reviews?: number | null
          trades?: string[]
          uid_nummer?: string | null
          updated_at?: string
          verified?: boolean | null
          versicherung_url?: string | null
          wallet_balance?: number | null
          website?: string | null
          zertifikate_urls?: string[] | null
        }
        Update: {
          accepts_urgent?: boolean | null
          address?: string | null
          auto_recharge_amount?: number | null
          auto_recharge_enabled?: boolean | null
          auto_recharge_threshold?: number | null
          availability_status?: string | null
          avg_response_time_minutes?: number | null
          capacity_per_month?: number | null
          city?: string | null
          company_name?: string
          conversion_rate?: number | null
          created_at?: string
          description?: string | null
          firmenname?: string | null
          free_leads_remaining?: number | null
          gewerbeschein_url?: string | null
          handwerker_status?:
            | Database["public"]["Enums"]["handwerker_status"]
            | null
          id?: string
          last_login?: string | null
          leads_bought?: number | null
          leads_won?: number | null
          min_project_value?: number | null
          portfolio_images?: string[] | null
          postal_codes?: string[]
          profile_image_url?: string | null
          quality_score?: number | null
          rating?: number | null
          rechtsform?: string | null
          service_radius?: number | null
          subscription_tier?: string | null
          team_size?: number | null
          total_reviews?: number | null
          trades?: string[]
          uid_nummer?: string | null
          updated_at?: string
          verified?: boolean | null
          versicherung_url?: string | null
          wallet_balance?: number | null
          website?: string | null
          zertifikate_urls?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "contractors_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          contractor_id: string | null
          created_at: string | null
          customer_id: string | null
          id: string
          last_message_at: string | null
          project_id: string | null
          updated_at: string | null
        }
        Insert: {
          contractor_id?: string | null
          created_at?: string | null
          customer_id?: string | null
          id?: string
          last_message_at?: string | null
          project_id?: string | null
          updated_at?: string | null
        }
        Update: {
          contractor_id?: string | null
          created_at?: string | null
          customer_id?: string | null
          id?: string
          last_message_at?: string | null
          project_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      gewerke_config: {
        Row: {
          base_price: number
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          keywords: string[]
          label: string
          min_project_value: number
          urgent_surcharge: number
        }
        Insert: {
          base_price: number
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id: string
          keywords: string[]
          label: string
          min_project_value: number
          urgent_surcharge: number
        }
        Update: {
          base_price?: number
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          keywords?: string[]
          label?: string
          min_project_value?: number
          urgent_surcharge?: number
        }
        Relationships: []
      }
      matches: {
        Row: {
          contractor_id: string
          created_at: string
          id: string
          lead_purchased: boolean | null
          match_type: string
          message: string | null
          project_id: string
          purchased_at: string | null
          score: number | null
          status: string | null
          updated_at: string
        }
        Insert: {
          contractor_id: string
          created_at?: string
          id?: string
          lead_purchased?: boolean | null
          match_type: string
          message?: string | null
          project_id: string
          purchased_at?: string | null
          score?: number | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          contractor_id?: string
          created_at?: string
          id?: string
          lead_purchased?: boolean | null
          match_type?: string
          message?: string | null
          project_id?: string
          purchased_at?: string | null
          score?: number | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "contractors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          conversation_id: string | null
          created_at: string | null
          id: string
          message: string
          read: boolean | null
          sender_id: string | null
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          message: string
          read?: boolean | null
          sender_id?: string | null
        }
        Update: {
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          message?: string
          read?: boolean | null
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          channels: string[] | null
          created_at: string | null
          data: Json | null
          expires_at: string | null
          handwerker_id: string
          id: string
          read: boolean | null
          read_at: string | null
          sent_via: string[] | null
          title: string
          type: string
        }
        Insert: {
          body: string
          channels?: string[] | null
          created_at?: string | null
          data?: Json | null
          expires_at?: string | null
          handwerker_id: string
          id?: string
          read?: boolean | null
          read_at?: string | null
          sent_via?: string[] | null
          title: string
          type: string
        }
        Update: {
          body?: string
          channels?: string[] | null
          created_at?: string | null
          data?: Json | null
          expires_at?: string | null
          handwerker_id?: string
          id?: string
          read?: boolean | null
          read_at?: string | null
          sent_via?: string[] | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_handwerker_id_fkey"
            columns: ["handwerker_id"]
            isOneToOne: false
            referencedRelation: "contractors"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          first_name?: string | null
          id: string
          last_name?: string | null
          phone?: string | null
          role: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          address: string | null
          assigned_handwerker: string[] | null
          base_price: number | null
          budget_max: number | null
          budget_min: number | null
          city: string
          created_at: string
          customer_id: string
          description: string
          estimated_value: number | null
          expires_at: string | null
          final_price: number | null
          fotos: string[] | null
          gewerk_id: string
          id: string
          images: string[] | null
          keywords: string[] | null
          postal_code: string
          preferred_start_date: string | null
          projekt_typ: string | null
          quality_checks: Json | null
          spam_score: number | null
          status: string | null
          title: string
          updated_at: string
          urgency: string | null
          visibility: string | null
        }
        Insert: {
          address?: string | null
          assigned_handwerker?: string[] | null
          base_price?: number | null
          budget_max?: number | null
          budget_min?: number | null
          city: string
          created_at?: string
          customer_id: string
          description: string
          estimated_value?: number | null
          expires_at?: string | null
          final_price?: number | null
          fotos?: string[] | null
          gewerk_id: string
          id?: string
          images?: string[] | null
          keywords?: string[] | null
          postal_code: string
          preferred_start_date?: string | null
          projekt_typ?: string | null
          quality_checks?: Json | null
          spam_score?: number | null
          status?: string | null
          title: string
          updated_at?: string
          urgency?: string | null
          visibility?: string | null
        }
        Update: {
          address?: string | null
          assigned_handwerker?: string[] | null
          base_price?: number | null
          budget_max?: number | null
          budget_min?: number | null
          city?: string
          created_at?: string
          customer_id?: string
          description?: string
          estimated_value?: number | null
          expires_at?: string | null
          final_price?: number | null
          fotos?: string[] | null
          gewerk_id?: string
          id?: string
          images?: string[] | null
          keywords?: string[] | null
          postal_code?: string
          preferred_start_date?: string | null
          projekt_typ?: string | null
          quality_checks?: Json | null
          spam_score?: number | null
          status?: string | null
          title?: string
          updated_at?: string
          urgency?: string | null
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_projects_gewerk"
            columns: ["gewerk_id"]
            isOneToOne: false
            referencedRelation: "gewerke_config"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      refund_requests: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          handwerker_id: string
          id: string
          lead_id: string
          proof_urls: string[] | null
          reason: string
          requested_amount: number
          resolved_at: string | null
          resolved_by: string | null
          status: Database["public"]["Enums"]["refund_status"] | null
          transaction_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          handwerker_id: string
          id?: string
          lead_id: string
          proof_urls?: string[] | null
          reason: string
          requested_amount: number
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["refund_status"] | null
          transaction_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          handwerker_id?: string
          id?: string
          lead_id?: string
          proof_urls?: string[] | null
          reason?: string
          requested_amount?: number
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["refund_status"] | null
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "refund_requests_handwerker_id_fkey"
            columns: ["handwerker_id"]
            isOneToOne: false
            referencedRelation: "contractors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refund_requests_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refund_requests_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refund_requests_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          handwerker_id: string
          id: string
          lead_id: string
          rating: number
          reviewer_type: string
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          handwerker_id: string
          id?: string
          lead_id: string
          rating: number
          reviewer_type: string
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          handwerker_id?: string
          id?: string
          lead_id?: string
          rating?: number
          reviewer_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_handwerker_id_fkey"
            columns: ["handwerker_id"]
            isOneToOne: false
            referencedRelation: "contractors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      service_categories: {
        Row: {
          active: boolean | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          level: number
          name: string
          parent_id: string | null
          slug: string
          sort_order: number | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id: string
          level: number
          name: string
          parent_id?: string | null
          slug: string
          sort_order?: number | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          level?: number
          name?: string
          parent_id?: string | null
          slug?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "service_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          balance_after: number
          created_at: string | null
          description: string | null
          handwerker_id: string
          id: string
          lead_id: string | null
          metadata: Json | null
          type: Database["public"]["Enums"]["transaction_type"]
        }
        Insert: {
          amount: number
          balance_after: number
          created_at?: string | null
          description?: string | null
          handwerker_id: string
          id?: string
          lead_id?: string | null
          metadata?: Json | null
          type: Database["public"]["Enums"]["transaction_type"]
        }
        Update: {
          amount?: number
          balance_after?: number
          created_at?: string | null
          description?: string | null
          handwerker_id?: string
          id?: string
          lead_id?: string | null
          metadata?: Json | null
          type?: Database["public"]["Enums"]["transaction_type"]
        }
        Relationships: [
          {
            foreignKeyName: "transactions_handwerker_id_fkey"
            columns: ["handwerker_id"]
            isOneToOne: false
            referencedRelation: "contractors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_lead_price: {
        Args: {
          p_description_length?: number
          p_gewerk_id: string
          p_has_photos?: boolean
          p_urgency: Database["public"]["Enums"]["urgency_type"]
        }
        Returns: number
      }
    }
    Enums: {
      gewerk_type:
        | "elektriker"
        | "sanitar-heizung"
        | "dachdecker"
        | "fassade"
        | "maler"
      handwerker_status:
        | "REGISTERED"
        | "DOCUMENTS_UPLOADED"
        | "UNDER_REVIEW"
        | "APPROVED"
        | "SUSPENDED"
        | "INCOMPLETE"
      refund_status: "PENDING" | "APPROVED" | "REJECTED"
      transaction_type:
        | "LEAD_PURCHASE"
        | "WALLET_RECHARGE"
        | "REFUND"
        | "ADJUSTMENT"
      urgency_type: "sofort" | "normal" | "flexibel"
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
    Enums: {
      gewerk_type: [
        "elektriker",
        "sanitar-heizung",
        "dachdecker",
        "fassade",
        "maler",
      ],
      handwerker_status: [
        "REGISTERED",
        "DOCUMENTS_UPLOADED",
        "UNDER_REVIEW",
        "APPROVED",
        "SUSPENDED",
        "INCOMPLETE",
      ],
      refund_status: ["PENDING", "APPROVED", "REJECTED"],
      transaction_type: [
        "LEAD_PURCHASE",
        "WALLET_RECHARGE",
        "REFUND",
        "ADJUSTMENT",
      ],
      urgency_type: ["sofort", "normal", "flexibel"],
    },
  },
} as const
