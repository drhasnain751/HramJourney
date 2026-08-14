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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      custom_package_requests: {
        Row: {
          accommodation_tier: string | null
          adults: number
          children: number
          country: string | null
          created_at: string
          duration: string | null
          email: string
          full_name: string
          id: string
          notes: string | null
          phone: string
          selected_services: string[]
          status: string
          transport_preference: string | null
          travel_date: string | null
          travel_month: string | null
          updated_at: string
        }
        Insert: {
          accommodation_tier?: string | null
          adults?: number
          children?: number
          country?: string | null
          created_at?: string
          duration?: string | null
          email: string
          full_name: string
          id?: string
          notes?: string | null
          phone: string
          selected_services?: string[]
          status?: string
          transport_preference?: string | null
          travel_date?: string | null
          travel_month?: string | null
          updated_at?: string
        }
        Update: {
          accommodation_tier?: string | null
          adults?: number
          children?: number
          country?: string | null
          created_at?: string
          duration?: string | null
          email?: string
          full_name?: string
          id?: string
          notes?: string | null
          phone?: string
          selected_services?: string[]
          status?: string
          transport_preference?: string | null
          travel_date?: string | null
          travel_month?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      hotel_images: {
        Row: {
          alt_text: string | null
          created_at: string
          display_order: number
          hotel_id: string
          id: string
          image_url: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          display_order?: number
          hotel_id: string
          id?: string
          image_url: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          display_order?: number
          hotel_id?: string
          id?: string
          image_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "hotel_images_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      hotels: {
        Row: {
          city: string
          created_at: string
          description: string | null
          display_order: number
          distance_from_haram: string | null
          facilities: string[]
          id: string
          is_featured: boolean
          location: string | null
          main_image_url: string | null
          name: string
          star_rating: number
          status: string
          updated_at: string
        }
        Insert: {
          city?: string
          created_at?: string
          description?: string | null
          display_order?: number
          distance_from_haram?: string | null
          facilities?: string[]
          id?: string
          is_featured?: boolean
          location?: string | null
          main_image_url?: string | null
          name: string
          star_rating?: number
          status?: string
          updated_at?: string
        }
        Update: {
          city?: string
          created_at?: string
          description?: string | null
          display_order?: number
          distance_from_haram?: string | null
          facilities?: string[]
          id?: string
          is_featured?: boolean
          location?: string | null
          main_image_url?: string | null
          name?: string
          star_rating?: number
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      inquiries: {
        Row: {
          accommodation_tier: string | null
          admin_notes: string | null
          adults: number | null
          children: number | null
          country: string | null
          created_at: string
          departure_city: string | null
          duration: string | null
          email: string
          extra_info: string | null
          full_name: string
          id: string
          message: string | null
          package_id: string | null
          package_name: string | null
          package_type: string | null
          phone: string
          selected_services: string[]
          status: string
          travel_date: string | null
          travelers: number | null
          updated_at: string
        }
        Insert: {
          accommodation_tier?: string | null
          admin_notes?: string | null
          adults?: number | null
          children?: number | null
          country?: string | null
          created_at?: string
          departure_city?: string | null
          duration?: string | null
          email: string
          extra_info?: string | null
          full_name: string
          id?: string
          message?: string | null
          package_id?: string | null
          package_name?: string | null
          package_type?: string | null
          phone: string
          selected_services?: string[]
          status?: string
          travel_date?: string | null
          travelers?: number | null
          updated_at?: string
        }
        Update: {
          accommodation_tier?: string | null
          admin_notes?: string | null
          adults?: number | null
          children?: number | null
          country?: string | null
          created_at?: string
          departure_city?: string | null
          duration?: string | null
          email?: string
          extra_info?: string | null
          full_name?: string
          id?: string
          message?: string | null
          package_id?: string | null
          package_name?: string | null
          package_type?: string | null
          phone?: string
          selected_services?: string[]
          status?: string
          travel_date?: string | null
          travelers?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inquiries_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      media: {
        Row: {
          created_at: string
          file_name: string
          file_path: string
          file_size: number | null
          folder: string
          id: string
          mime_type: string | null
          public_url: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path: string
          file_size?: number | null
          folder?: string
          id?: string
          mime_type?: string | null
          public_url: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          folder?: string
          id?: string
          mime_type?: string | null
          public_url?: string
        }
        Relationships: []
      }
      package_exclusions: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          icon: string | null
          id: string
          package_id: string
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          icon?: string | null
          id?: string
          package_id: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          icon?: string | null
          id?: string
          package_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "package_exclusions_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      package_images: {
        Row: {
          alt_text: string | null
          category: string
          created_at: string
          display_order: number
          id: string
          image_url: string
          is_primary: boolean
          package_id: string
        }
        Insert: {
          alt_text?: string | null
          category?: string
          created_at?: string
          display_order?: number
          id?: string
          image_url: string
          is_primary?: boolean
          package_id: string
        }
        Update: {
          alt_text?: string | null
          category?: string
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string
          is_primary?: boolean
          package_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "package_images_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      package_inclusions: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          icon: string | null
          id: string
          package_id: string
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          icon?: string | null
          id?: string
          package_id: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          icon?: string | null
          id?: string
          package_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "package_inclusions_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      packages: {
        Row: {
          accommodation_description: string | null
          badge: string | null
          created_at: string
          currency: string
          departure_info: string | null
          display_order: number
          duration: string | null
          flight_info: string | null
          full_description: string | null
          hotel_category: string | null
          id: string
          is_featured: boolean
          is_popular: boolean
          madinah_hotel: string | null
          main_image_url: string | null
          makkah_hotel: string | null
          name: string
          package_type: string
          price_display_type: string
          price_notes: string | null
          price_text: string | null
          room_type: string | null
          short_description: string | null
          slug: string
          starting_price: number | null
          status: string
          tier: string | null
          transport_info: string | null
          travel_date_info: string | null
          updated_at: string
        }
        Insert: {
          accommodation_description?: string | null
          badge?: string | null
          created_at?: string
          currency?: string
          departure_info?: string | null
          display_order?: number
          duration?: string | null
          flight_info?: string | null
          full_description?: string | null
          hotel_category?: string | null
          id?: string
          is_featured?: boolean
          is_popular?: boolean
          madinah_hotel?: string | null
          main_image_url?: string | null
          makkah_hotel?: string | null
          name: string
          package_type?: string
          price_display_type?: string
          price_notes?: string | null
          price_text?: string | null
          room_type?: string | null
          short_description?: string | null
          slug: string
          starting_price?: number | null
          status?: string
          tier?: string | null
          transport_info?: string | null
          travel_date_info?: string | null
          updated_at?: string
        }
        Update: {
          accommodation_description?: string | null
          badge?: string | null
          created_at?: string
          currency?: string
          departure_info?: string | null
          display_order?: number
          duration?: string | null
          flight_info?: string | null
          full_description?: string | null
          hotel_category?: string | null
          id?: string
          is_featured?: boolean
          is_popular?: boolean
          madinah_hotel?: string | null
          main_image_url?: string | null
          makkah_hotel?: string | null
          name?: string
          package_type?: string
          price_display_type?: string
          price_notes?: string | null
          price_text?: string | null
          room_type?: string | null
          short_description?: string | null
          slug?: string
          starting_price?: number | null
          status?: string
          tier?: string | null
          transport_info?: string | null
          travel_date_info?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          icon: string | null
          id: string
          image_url: string | null
          name: string
          show_in_builder: boolean
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          icon?: string | null
          id?: string
          image_url?: string | null
          name: string
          show_in_builder?: boolean
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          icon?: string | null
          id?: string
          image_url?: string | null
          name?: string
          show_in_builder?: boolean
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          id: string
          image_url: string | null
          key: string
          label: string
          updated_at: string
          value: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          image_url?: string | null
          key: string
          label: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          image_url?: string | null
          key?: string
          label?: string
          updated_at?: string
          value?: string | null
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin"
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
      app_role: ["admin"],
    },
  },
} as const
