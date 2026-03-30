export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          timezone: string;
          theme: string;
          created_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          timezone?: string;
          theme?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          timezone?: string;
          theme?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      skills: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          color: string;
          goal_type: string | null;
          goal_target_hours: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          color?: string;
          goal_type?: string | null;
          goal_target_hours?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          color?: string;
          goal_type?: string | null;
          goal_target_hours?: number | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "skills_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      sessions: {
        Row: {
          id: string;
          user_id: string;
          skill_id: string;
          duration_minutes: number;
          date: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          skill_id: string;
          duration_minutes: number;
          date: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          skill_id?: string;
          duration_minutes?: number;
          date?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "sessions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "sessions_skill_id_fkey";
            columns: ["skill_id"];
            isOneToOne: false;
            referencedRelation: "skills";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
}
