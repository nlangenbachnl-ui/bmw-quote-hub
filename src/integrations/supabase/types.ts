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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      quote_requests: {
        Row: {
          bmw_model: string
          created_at: string
          email: string
          id: string
          model_year: string
          name: string
          notes: string | null
          parts_requested: string
          phone: string
          photo_paths: string[]
          status: string
          vin: string | null
        }
        Insert: {
          bmw_model: string
          created_at?: string
          email: string
          id?: string
          model_year: string
          name: string
          notes?: string | null
          parts_requested: string
          phone: string
          photo_paths?: string[]
          status?: string
          vin?: string | null
        }
        Update: {
          bmw_model?: string
          created_at?: string
          email?: string
          id?: string
          model_year?: string
          name?: string
          notes?: string | null
          parts_requested?: string
          phone?: string
          photo_paths?: string[]
          status?: string
          vin?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wholesale_application_events: {
        Row: {
          actor_id: string | null
          application_id: string
          created_at: string
          event_type: string
          from_status:
            | Database["public"]["Enums"]["wholesale_app_status"]
            | null
          id: string
          note: string | null
          to_status: Database["public"]["Enums"]["wholesale_app_status"] | null
        }
        Insert: {
          actor_id?: string | null
          application_id: string
          created_at?: string
          event_type?: string
          from_status?:
            | Database["public"]["Enums"]["wholesale_app_status"]
            | null
          id?: string
          note?: string | null
          to_status?: Database["public"]["Enums"]["wholesale_app_status"] | null
        }
        Update: {
          actor_id?: string | null
          application_id?: string
          created_at?: string
          event_type?: string
          from_status?:
            | Database["public"]["Enums"]["wholesale_app_status"]
            | null
          id?: string
          note?: string | null
          to_status?: Database["public"]["Enums"]["wholesale_app_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "wholesale_application_events_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "wholesale_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      wholesale_applications: {
        Row: {
          additional_notes: string | null
          agreed_to_terms: boolean
          billing_address_line1: string
          billing_address_line2: string | null
          billing_city: string
          billing_postal_code: string
          billing_state: string
          bmw_mini_specialist: boolean
          brands_serviced: string | null
          business_email: string
          business_phone: string
          business_type: Database["public"]["Enums"]["wholesale_business_type"]
          certified_accurate: boolean
          contact_name: string
          created_at: string
          dba_name: string | null
          id: string
          job_title: string | null
          legal_business_name: string
          monthly_spend_estimate: string | null
          preferred_contact_method: string
          reference_code: string
          resale_certificate_path: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          shipping_address_line1: string | null
          shipping_address_line2: string | null
          shipping_city: string | null
          shipping_postal_code: string | null
          shipping_same_as_billing: boolean
          shipping_state: string | null
          status: Database["public"]["Enums"]["wholesale_app_status"]
          tax_exempt_requested: boolean
          tax_id: string
          tier: Database["public"]["Enums"]["wholesale_tier"] | null
          updated_at: string
          user_id: string | null
          website: string | null
          years_in_business: string | null
        }
        Insert: {
          additional_notes?: string | null
          agreed_to_terms?: boolean
          billing_address_line1: string
          billing_address_line2?: string | null
          billing_city: string
          billing_postal_code: string
          billing_state: string
          bmw_mini_specialist?: boolean
          brands_serviced?: string | null
          business_email: string
          business_phone: string
          business_type: Database["public"]["Enums"]["wholesale_business_type"]
          certified_accurate?: boolean
          contact_name: string
          created_at?: string
          dba_name?: string | null
          id?: string
          job_title?: string | null
          legal_business_name: string
          monthly_spend_estimate?: string | null
          preferred_contact_method?: string
          reference_code?: string
          resale_certificate_path?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          shipping_address_line1?: string | null
          shipping_address_line2?: string | null
          shipping_city?: string | null
          shipping_postal_code?: string | null
          shipping_same_as_billing?: boolean
          shipping_state?: string | null
          status?: Database["public"]["Enums"]["wholesale_app_status"]
          tax_exempt_requested?: boolean
          tax_id: string
          tier?: Database["public"]["Enums"]["wholesale_tier"] | null
          updated_at?: string
          user_id?: string | null
          website?: string | null
          years_in_business?: string | null
        }
        Update: {
          additional_notes?: string | null
          agreed_to_terms?: boolean
          billing_address_line1?: string
          billing_address_line2?: string | null
          billing_city?: string
          billing_postal_code?: string
          billing_state?: string
          bmw_mini_specialist?: boolean
          brands_serviced?: string | null
          business_email?: string
          business_phone?: string
          business_type?: Database["public"]["Enums"]["wholesale_business_type"]
          certified_accurate?: boolean
          contact_name?: string
          created_at?: string
          dba_name?: string | null
          id?: string
          job_title?: string | null
          legal_business_name?: string
          monthly_spend_estimate?: string | null
          preferred_contact_method?: string
          reference_code?: string
          resale_certificate_path?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          shipping_address_line1?: string | null
          shipping_address_line2?: string | null
          shipping_city?: string | null
          shipping_postal_code?: string | null
          shipping_same_as_billing?: boolean
          shipping_state?: string | null
          status?: Database["public"]["Enums"]["wholesale_app_status"]
          tax_exempt_requested?: boolean
          tax_id?: string
          tier?: Database["public"]["Enums"]["wholesale_tier"] | null
          updated_at?: string
          user_id?: string | null
          website?: string | null
          years_in_business?: string | null
        }
        Relationships: []
      }
      wholesale_invoices: {
        Row: {
          amount: number
          created_at: string
          file_path: string | null
          id: string
          invoice_number: string
          issued_on: string
          order_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          file_path?: string | null
          id?: string
          invoice_number: string
          issued_on?: string
          order_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          file_path?: string | null
          id?: string
          invoice_number?: string
          issued_on?: string
          order_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wholesale_invoices_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "wholesale_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      wholesale_orders: {
        Row: {
          carrier: string | null
          created_at: string
          id: string
          order_number: string
          placed_at: string
          po_number: string | null
          request_id: string | null
          status: string
          total_amount: number | null
          tracking_number: string | null
          tracking_status: string | null
          tracking_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          carrier?: string | null
          created_at?: string
          id?: string
          order_number?: string
          placed_at?: string
          po_number?: string | null
          request_id?: string | null
          status?: string
          total_amount?: number | null
          tracking_number?: string | null
          tracking_status?: string | null
          tracking_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          carrier?: string | null
          created_at?: string
          id?: string
          order_number?: string
          placed_at?: string
          po_number?: string | null
          request_id?: string | null
          status?: string
          total_amount?: number | null
          tracking_number?: string | null
          tracking_status?: string | null
          tracking_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wholesale_orders_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "wholesale_parts_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      wholesale_parts_requests: {
        Row: {
          attachment_paths: string[]
          created_at: string
          fulfillment_preference: string
          id: string
          model: string | null
          model_year: string | null
          notes: string | null
          po_number: string | null
          reference_code: string
          status: string
          updated_at: string
          urgency: string
          user_id: string
          vehicle_id: string | null
          vin: string | null
        }
        Insert: {
          attachment_paths?: string[]
          created_at?: string
          fulfillment_preference?: string
          id?: string
          model?: string | null
          model_year?: string | null
          notes?: string | null
          po_number?: string | null
          reference_code?: string
          status?: string
          updated_at?: string
          urgency?: string
          user_id: string
          vehicle_id?: string | null
          vin?: string | null
        }
        Update: {
          attachment_paths?: string[]
          created_at?: string
          fulfillment_preference?: string
          id?: string
          model?: string | null
          model_year?: string | null
          notes?: string | null
          po_number?: string | null
          reference_code?: string
          status?: string
          updated_at?: string
          urgency?: string
          user_id?: string
          vehicle_id?: string | null
          vin?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wholesale_parts_requests_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "wholesale_vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      wholesale_profiles: {
        Row: {
          application_id: string | null
          company_name: string
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          delivery_instructions: string | null
          id: string
          ship_address_line1: string | null
          ship_address_line2: string | null
          ship_city: string | null
          ship_postal_code: string | null
          ship_state: string | null
          status: Database["public"]["Enums"]["wholesale_app_status"]
          tier: Database["public"]["Enums"]["wholesale_tier"]
          updated_at: string
          user_id: string
        }
        Insert: {
          application_id?: string | null
          company_name: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          delivery_instructions?: string | null
          id?: string
          ship_address_line1?: string | null
          ship_address_line2?: string | null
          ship_city?: string | null
          ship_postal_code?: string | null
          ship_state?: string | null
          status?: Database["public"]["Enums"]["wholesale_app_status"]
          tier?: Database["public"]["Enums"]["wholesale_tier"]
          updated_at?: string
          user_id: string
        }
        Update: {
          application_id?: string | null
          company_name?: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          delivery_instructions?: string | null
          id?: string
          ship_address_line1?: string | null
          ship_address_line2?: string | null
          ship_city?: string | null
          ship_postal_code?: string | null
          ship_state?: string | null
          status?: Database["public"]["Enums"]["wholesale_app_status"]
          tier?: Database["public"]["Enums"]["wholesale_tier"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wholesale_profiles_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "wholesale_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      wholesale_request_items: {
        Row: {
          created_at: string
          description: string
          id: string
          part_number: string | null
          quantity: number
          request_id: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          part_number?: string | null
          quantity?: number
          request_id: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          part_number?: string | null
          quantity?: number
          request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wholesale_request_items_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "wholesale_parts_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      wholesale_tier_pricing: {
        Row: {
          description: string | null
          discount_percent: number | null
          is_sample: boolean
          tier: Database["public"]["Enums"]["wholesale_tier"]
          updated_at: string
        }
        Insert: {
          description?: string | null
          discount_percent?: number | null
          is_sample?: boolean
          tier: Database["public"]["Enums"]["wholesale_tier"]
          updated_at?: string
        }
        Update: {
          description?: string | null
          discount_percent?: number | null
          is_sample?: boolean
          tier?: Database["public"]["Enums"]["wholesale_tier"]
          updated_at?: string
        }
        Relationships: []
      }
      wholesale_vehicles: {
        Row: {
          chassis_notes: string | null
          created_at: string
          id: string
          model: string | null
          model_year: string | null
          nickname: string
          updated_at: string
          user_id: string
          vin: string
        }
        Insert: {
          chassis_notes?: string | null
          created_at?: string
          id?: string
          model?: string | null
          model_year?: string | null
          nickname: string
          updated_at?: string
          user_id: string
          vin: string
        }
        Update: {
          chassis_notes?: string | null
          created_at?: string
          id?: string
          model?: string | null
          model_year?: string | null
          nickname?: string
          updated_at?: string
          user_id?: string
          vin?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_wholesale_application: {
        Args: { _reference_code: string }
        Returns: {
          application_id: string | null
          company_name: string
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          delivery_instructions: string | null
          id: string
          ship_address_line1: string | null
          ship_address_line2: string | null
          ship_city: string | null
          ship_postal_code: string | null
          ship_state: string | null
          status: Database["public"]["Enums"]["wholesale_app_status"]
          tier: Database["public"]["Enums"]["wholesale_tier"]
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "wholesale_profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      generate_reference: { Args: { _prefix: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      submit_wholesale_application: {
        Args: { _payload: Json }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "staff" | "user"
      wholesale_app_status:
        | "pending"
        | "under_review"
        | "more_info_requested"
        | "approved"
        | "denied"
      wholesale_business_type:
        | "independent_repair"
        | "body_shop"
        | "dealership"
        | "fleet"
        | "performance_tuning"
        | "other"
      wholesale_tier: "standard" | "plus" | "preferred"
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
      app_role: ["admin", "staff", "user"],
      wholesale_app_status: [
        "pending",
        "under_review",
        "more_info_requested",
        "approved",
        "denied",
      ],
      wholesale_business_type: [
        "independent_repair",
        "body_shop",
        "dealership",
        "fleet",
        "performance_tuning",
        "other",
      ],
      wholesale_tier: ["standard", "plus", "preferred"],
    },
  },
} as const
