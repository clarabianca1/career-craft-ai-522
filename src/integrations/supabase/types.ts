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
      applications: {
        Row: {
          applied_at: string | null
          created_at: string
          id: string
          job_id: string | null
          job_url: string | null
          notes: string | null
          resume_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          applied_at?: string | null
          created_at?: string
          id?: string
          job_id?: string | null
          job_url?: string | null
          notes?: string | null
          resume_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          applied_at?: string | null
          created_at?: string
          id?: string
          job_id?: string | null
          job_url?: string | null
          notes?: string | null
          resume_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
        ]
      }
      certifications: {
        Row: {
          created_at: string
          id: string
          issuer: string | null
          name: string
          user_id: string
          year: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          issuer?: string | null
          name: string
          user_id: string
          year?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          issuer?: string | null
          name?: string
          user_id?: string
          year?: string | null
        }
        Relationships: []
      }
      education: {
        Row: {
          course: string | null
          created_at: string
          degree: string | null
          end_date: string | null
          id: string
          institution: string
          start_date: string | null
          user_id: string
        }
        Insert: {
          course?: string | null
          created_at?: string
          degree?: string | null
          end_date?: string | null
          id?: string
          institution: string
          start_date?: string | null
          user_id: string
        }
        Update: {
          course?: string | null
          created_at?: string
          degree?: string | null
          end_date?: string | null
          id?: string
          institution?: string
          start_date?: string | null
          user_id?: string
        }
        Relationships: []
      }
      experiences: {
        Row: {
          achievements: string | null
          company: string
          created_at: string
          current: boolean
          description: string | null
          end_date: string | null
          id: string
          location: string | null
          position: string
          responsibilities: string | null
          skills: string[]
          sort_order: number
          start_date: string | null
          user_id: string
        }
        Insert: {
          achievements?: string | null
          company: string
          created_at?: string
          current?: boolean
          description?: string | null
          end_date?: string | null
          id?: string
          location?: string | null
          position: string
          responsibilities?: string | null
          skills?: string[]
          sort_order?: number
          start_date?: string | null
          user_id: string
        }
        Update: {
          achievements?: string | null
          company?: string
          created_at?: string
          current?: boolean
          description?: string | null
          end_date?: string | null
          id?: string
          location?: string | null
          position?: string
          responsibilities?: string | null
          skills?: string[]
          sort_order?: number
          start_date?: string | null
          user_id?: string
        }
        Relationships: []
      }
      job_matches: {
        Row: {
          analysis: Json | null
          created_at: string
          id: string
          job_id: string
          match_score: number
          matching_skills: string[]
          missing_information: string[]
          user_id: string
        }
        Insert: {
          analysis?: Json | null
          created_at?: string
          id?: string
          job_id: string
          match_score?: number
          matching_skills?: string[]
          missing_information?: string[]
          user_id: string
        }
        Update: {
          analysis?: Json | null
          created_at?: string
          id?: string
          job_id?: string
          match_score?: number
          matching_skills?: string[]
          missing_information?: string[]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_matches_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          area: string | null
          benefits: string[]
          company: string
          created_at: string
          description: string | null
          id: string
          keywords: string[]
          location: string | null
          published_at: string
          requirements: string[]
          responsibilities: string[]
          salary_max: number | null
          salary_min: number | null
          seniority: string | null
          source: string
          source_url: string | null
          title: string
          work_model: string | null
        }
        Insert: {
          area?: string | null
          benefits?: string[]
          company: string
          created_at?: string
          description?: string | null
          id?: string
          keywords?: string[]
          location?: string | null
          published_at?: string
          requirements?: string[]
          responsibilities?: string[]
          salary_max?: number | null
          salary_min?: number | null
          seniority?: string | null
          source?: string
          source_url?: string | null
          title: string
          work_model?: string | null
        }
        Update: {
          area?: string | null
          benefits?: string[]
          company?: string
          created_at?: string
          description?: string | null
          id?: string
          keywords?: string[]
          location?: string | null
          published_at?: string
          requirements?: string[]
          responsibilities?: string[]
          salary_max?: number | null
          salary_min?: number | null
          seniority?: string | null
          source?: string
          source_url?: string | null
          title?: string
          work_model?: string | null
        }
        Relationships: []
      }
      languages: {
        Row: {
          created_at: string
          id: string
          language: string
          level: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          language: string
          level?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          language?: string
          level?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          availability: string | null
          city: string | null
          created_at: string
          desired_location: string | null
          email: string | null
          github: string | null
          id: string
          linkedin: string | null
          name: string | null
          onboarding_completed: boolean
          phone: string | null
          portfolio: string | null
          professional_area: string | null
          profile_completion: number
          resume_text: string | null
          salary_expectation: string | null
          seniority: string | null
          state: string | null
          summary: string | null
          target_role: string | null
          updated_at: string
          website: string | null
          work_model: string | null
        }
        Insert: {
          availability?: string | null
          city?: string | null
          created_at?: string
          desired_location?: string | null
          email?: string | null
          github?: string | null
          id: string
          linkedin?: string | null
          name?: string | null
          onboarding_completed?: boolean
          phone?: string | null
          portfolio?: string | null
          professional_area?: string | null
          profile_completion?: number
          resume_text?: string | null
          salary_expectation?: string | null
          seniority?: string | null
          state?: string | null
          summary?: string | null
          target_role?: string | null
          updated_at?: string
          website?: string | null
          work_model?: string | null
        }
        Update: {
          availability?: string | null
          city?: string | null
          created_at?: string
          desired_location?: string | null
          email?: string | null
          github?: string | null
          id?: string
          linkedin?: string | null
          name?: string | null
          onboarding_completed?: boolean
          phone?: string | null
          portfolio?: string | null
          professional_area?: string | null
          profile_completion?: number
          resume_text?: string | null
          salary_expectation?: string | null
          seniority?: string | null
          state?: string | null
          summary?: string | null
          target_role?: string | null
          updated_at?: string
          website?: string | null
          work_model?: string | null
        }
        Relationships: []
      }
      resumes: {
        Row: {
          ats_analysis: Json | null
          ats_score: number | null
          changes: Json | null
          content: Json
          created_at: string
          id: string
          status: string
          target_job_id: string | null
          template: string
          title: string
          updated_at: string
          user_id: string
          version: number
        }
        Insert: {
          ats_analysis?: Json | null
          ats_score?: number | null
          changes?: Json | null
          content?: Json
          created_at?: string
          id?: string
          status?: string
          target_job_id?: string | null
          template?: string
          title: string
          updated_at?: string
          user_id: string
          version?: number
        }
        Update: {
          ats_analysis?: Json | null
          ats_score?: number | null
          changes?: Json | null
          content?: Json
          created_at?: string
          id?: string
          status?: string
          target_job_id?: string | null
          template?: string
          title?: string
          updated_at?: string
          user_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "resumes_target_job_id_fkey"
            columns: ["target_job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      skills: {
        Row: {
          created_at: string
          id: string
          name: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          type?: string
          user_id?: string
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
