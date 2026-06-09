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
      classes: {
        Row: {
          created_at: string
          id: string
          level: number | null
          name: string
          school_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          level?: number | null
          name: string
          school_id: string
        }
        Update: {
          created_at?: string
          id?: string
          level?: number | null
          name?: string
          school_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "classes_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          admission_number: string
          amount: number
          balance_after: number | null
          balance_before: number | null
          created_at: string
          id: string
          is_reversed: boolean
          mpesa_transaction_code: string | null
          notes: string | null
          payment_date: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          receipt_number: string | null
          recorded_by: string | null
          recorded_by_name: string | null
          school_id: string
          student_id: string
        }
        Insert: {
          admission_number: string
          amount: number
          balance_after?: number | null
          balance_before?: number | null
          created_at?: string
          id?: string
          is_reversed?: boolean
          mpesa_transaction_code?: string | null
          notes?: string | null
          payment_date?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          receipt_number?: string | null
          recorded_by?: string | null
          recorded_by_name?: string | null
          school_id: string
          student_id: string
        }
        Update: {
          admission_number?: string
          amount?: number
          balance_after?: number | null
          balance_before?: number | null
          created_at?: string
          id?: string
          is_reversed?: boolean
          mpesa_transaction_code?: string | null
          notes?: string | null
          payment_date?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          receipt_number?: string | null
          recorded_by?: string | null
          recorded_by_name?: string | null
          school_id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      receipts: {
        Row: {
          admission_number: string
          amount: number
          created_at: string
          id: string
          new_balance: number | null
          payment_date: string
          payment_id: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          previous_balance: number | null
          receipt_number: string
          recorded_by_name: string | null
          school_id: string
          student_id: string
          student_name: string
        }
        Insert: {
          admission_number: string
          amount: number
          created_at?: string
          id?: string
          new_balance?: number | null
          payment_date: string
          payment_id: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          previous_balance?: number | null
          receipt_number: string
          recorded_by_name?: string | null
          school_id: string
          student_id: string
          student_name: string
        }
        Update: {
          admission_number?: string
          amount?: number
          created_at?: string
          id?: string
          new_balance?: number | null
          payment_date?: string
          payment_id?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          previous_balance?: number | null
          receipt_number?: string
          recorded_by_name?: string | null
          school_id?: string
          student_id?: string
          student_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "receipts_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receipts_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receipts_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      schools: {
        Row: {
          created_at: string
          id: string
          logo_url: string | null
          name: string
          plan: string | null
          subscription_status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
          plan?: string | null
          subscription_status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          plan?: string | null
          subscription_status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      staff: {
        Row: {
          created_at: string
          email: string | null
          full_name: string
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["app_role"]
          school_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          school_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          school_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          admission_number: string
          balance: number | null
          class_id: string | null
          created_at: string
          full_name: string
          id: string
          parent_name: string | null
          parent_phone: string | null
          school_id: string
          status: Database["public"]["Enums"]["student_status"]
          term_fee: number
          total_paid: number
          updated_at: string
        }
        Insert: {
          admission_number: string
          balance?: number | null
          class_id?: string | null
          created_at?: string
          full_name: string
          id?: string
          parent_name?: string | null
          parent_phone?: string | null
          school_id: string
          status?: Database["public"]["Enums"]["student_status"]
          term_fee?: number
          total_paid?: number
          updated_at?: string
        }
        Update: {
          admission_number?: string
          balance?: number | null
          class_id?: string | null
          created_at?: string
          full_name?: string
          id?: string
          parent_name?: string | null
          parent_phone?: string | null
          school_id?: string
          status?: Database["public"]["Enums"]["student_status"]
          term_fee?: number
          total_paid?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      unmatched_payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          mpesa_transaction_code: string | null
          received_at: string
          reference: string | null
          school_id: string
          sender_name: string | null
          sender_phone: string | null
          status: Database["public"]["Enums"]["unmatched_status"]
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          mpesa_transaction_code?: string | null
          received_at?: string
          reference?: string | null
          school_id: string
          sender_name?: string | null
          sender_phone?: string | null
          status?: Database["public"]["Enums"]["unmatched_status"]
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          mpesa_transaction_code?: string | null
          received_at?: string
          reference?: string | null
          school_id?: string
          sender_name?: string | null
          sender_phone?: string | null
          status?: Database["public"]["Enums"]["unmatched_status"]
        }
        Relationships: [
          {
            foreignKeyName: "unmatched_payments_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_school_admin: { Args: { _school_id: string }; Returns: boolean }
      is_school_member: { Args: { _school_id: string }; Returns: boolean }
      my_school_id: { Args: never; Returns: string }
    }
    Enums: {
      app_role: "super_admin" | "school_admin" | "clerk"
      payment_method: "mpesa" | "bank" | "cash" | "cheque"
      student_status: "active" | "inactive" | "graduated"
      unmatched_status: "pending" | "matched" | "ignored"
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
      app_role: ["super_admin", "school_admin", "clerk"],
      payment_method: ["mpesa", "bank", "cash", "cheque"],
      student_status: ["active", "inactive", "graduated"],
      unmatched_status: ["pending", "matched", "ignored"],
    },
  },
} as const
