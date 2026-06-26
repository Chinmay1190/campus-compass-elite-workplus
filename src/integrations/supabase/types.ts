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
      announcements: {
        Row: {
          audience: string
          author_id: string | null
          body: string
          created_at: string
          expires_at: string | null
          id: string
          pinned: boolean
          priority: string
          title: string
        }
        Insert: {
          audience?: string
          author_id?: string | null
          body: string
          created_at?: string
          expires_at?: string | null
          id?: string
          pinned?: boolean
          priority?: string
          title: string
        }
        Update: {
          audience?: string
          author_id?: string | null
          body?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          pinned?: boolean
          priority?: string
          title?: string
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          academic_year: string | null
          address: string | null
          contact_email: string | null
          default_term: string | null
          id: string
          institution_name: string
          notify_attendance_digest: boolean
          notify_overdue_tuition: boolean
          notify_sms_faculty: boolean
          phone: string | null
          registrar: string | null
          updated_at: string
        }
        Insert: {
          academic_year?: string | null
          address?: string | null
          contact_email?: string | null
          default_term?: string | null
          id?: string
          institution_name?: string
          notify_attendance_digest?: boolean
          notify_overdue_tuition?: boolean
          notify_sms_faculty?: boolean
          phone?: string | null
          registrar?: string | null
          updated_at?: string
        }
        Update: {
          academic_year?: string | null
          address?: string | null
          contact_email?: string | null
          default_term?: string | null
          id?: string
          institution_name?: string
          notify_attendance_digest?: boolean
          notify_overdue_tuition?: boolean
          notify_sms_faculty?: boolean
          phone?: string | null
          registrar?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      attendance: {
        Row: {
          course_id: string
          created_at: string
          date: string
          id: string
          recorded_by: string | null
          status: string
          student_id: string
        }
        Insert: {
          course_id: string
          created_at?: string
          date?: string
          id?: string
          recorded_by?: string | null
          status: string
          student_id: string
        }
        Update: {
          course_id?: string
          created_at?: string
          date?: string
          id?: string
          recorded_by?: string | null
          status?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      book_loans: {
        Row: {
          book_id: string
          borrowed_on: string
          created_at: string
          due_date: string
          id: string
          returned_on: string | null
          student_id: string
        }
        Insert: {
          book_id: string
          borrowed_on?: string
          created_at?: string
          due_date: string
          id?: string
          returned_on?: string | null
          student_id: string
        }
        Update: {
          book_id?: string
          borrowed_on?: string
          created_at?: string
          due_date?: string
          id?: string
          returned_on?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_loans_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "library_books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_loans_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          capacity: number
          code: string
          created_at: string
          credits: number
          department: string
          description: string | null
          id: string
          instructor_id: string | null
          schedule: string | null
          semester: string | null
          title: string
          updated_at: string
        }
        Insert: {
          capacity?: number
          code: string
          created_at?: string
          credits?: number
          department: string
          description?: string | null
          id?: string
          instructor_id?: string | null
          schedule?: string | null
          semester?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          capacity?: number
          code?: string
          created_at?: string
          credits?: number
          department?: string
          description?: string | null
          id?: string
          instructor_id?: string | null
          schedule?: string | null
          semester?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          course_id: string
          enrolled_on: string
          id: string
          student_id: string
        }
        Insert: {
          course_id: string
          enrolled_on?: string
          id?: string
          student_id: string
        }
        Update: {
          course_id?: string
          enrolled_on?: string
          id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      exams: {
        Row: {
          course_id: string
          created_at: string
          duration_minutes: number | null
          exam_date: string
          id: string
          instructions: string | null
          location: string | null
          start_time: string | null
          title: string
          total_marks: number
        }
        Insert: {
          course_id: string
          created_at?: string
          duration_minutes?: number | null
          exam_date: string
          id?: string
          instructions?: string | null
          location?: string | null
          start_time?: string | null
          title: string
          total_marks?: number
        }
        Update: {
          course_id?: string
          created_at?: string
          duration_minutes?: number | null
          exam_date?: string
          id?: string
          instructions?: string | null
          location?: string | null
          start_time?: string | null
          title?: string
          total_marks?: number
        }
        Relationships: [
          {
            foreignKeyName: "exams_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      fees: {
        Row: {
          amount: number
          created_at: string
          due_date: string
          id: string
          invoice_no: string
          method: string | null
          status: string
          student_id: string
          term: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          due_date: string
          id?: string
          invoice_no: string
          method?: string | null
          status?: string
          student_id: string
          term: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          due_date?: string
          id?: string
          invoice_no?: string
          method?: string | null
          status?: string
          student_id?: string
          term?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fees_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      grades: {
        Row: {
          created_at: string
          exam_id: string
          graded_by: string | null
          id: string
          score: number
          student_id: string
        }
        Insert: {
          created_at?: string
          exam_id: string
          graded_by?: string | null
          id?: string
          score: number
          student_id: string
        }
        Update: {
          created_at?: string
          exam_id?: string
          graded_by?: string | null
          id?: string
          score?: number
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "grades_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grades_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      library_books: {
        Row: {
          author: string
          available_copies: number
          category: string | null
          created_at: string
          edition: string | null
          id: string
          isbn: string | null
          publisher: string | null
          shelf: string | null
          title: string
          total_copies: number
          updated_at: string
          year_published: number | null
        }
        Insert: {
          author: string
          available_copies?: number
          category?: string | null
          created_at?: string
          edition?: string | null
          id?: string
          isbn?: string | null
          publisher?: string | null
          shelf?: string | null
          title: string
          total_copies?: number
          updated_at?: string
          year_published?: number | null
        }
        Update: {
          author?: string
          available_copies?: number
          category?: string | null
          created_at?: string
          edition?: string | null
          id?: string
          isbn?: string | null
          publisher?: string | null
          shelf?: string | null
          title?: string
          total_copies?: number
          updated_at?: string
          year_published?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          id: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      students: {
        Row: {
          address: string | null
          course_id: string | null
          created_at: string
          date_of_birth: string | null
          email: string
          enrolled_on: string
          full_name: string
          gender: string | null
          gpa: number | null
          guardian_name: string | null
          guardian_phone: string | null
          id: string
          phone: string | null
          status: string
          student_no: string
          updated_at: string
          user_id: string | null
          year: number
        }
        Insert: {
          address?: string | null
          course_id?: string | null
          created_at?: string
          date_of_birth?: string | null
          email: string
          enrolled_on?: string
          full_name: string
          gender?: string | null
          gpa?: number | null
          guardian_name?: string | null
          guardian_phone?: string | null
          id?: string
          phone?: string | null
          status?: string
          student_no: string
          updated_at?: string
          user_id?: string | null
          year?: number
        }
        Update: {
          address?: string | null
          course_id?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string
          enrolled_on?: string
          full_name?: string
          gender?: string | null
          gpa?: number | null
          guardian_name?: string | null
          guardian_phone?: string | null
          id?: string
          phone?: string | null
          status?: string
          student_no?: string
          updated_at?: string
          user_id?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "students_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      teachers: {
        Row: {
          created_at: string
          department: string
          email: string
          full_name: string
          id: string
          joined_year: number | null
          office: string | null
          phone: string | null
          qualification: string | null
          specialization: string | null
          staff_no: string
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          department: string
          email: string
          full_name: string
          id?: string
          joined_year?: number | null
          office?: string | null
          phone?: string | null
          qualification?: string | null
          specialization?: string | null
          staff_no: string
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          department?: string
          email?: string
          full_name?: string
          id?: string
          joined_year?: number | null
          office?: string | null
          phone?: string | null
          qualification?: string | null
          specialization?: string | null
          staff_no?: string
          title?: string
          updated_at?: string
          user_id?: string | null
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
    }
    Enums: {
      app_role: "admin" | "teacher" | "student"
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
      app_role: ["admin", "teacher", "student"],
    },
  },
} as const
