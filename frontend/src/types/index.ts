export interface Project {
  id: number;
  title: string;
  description: string;
  category: string;
  location_lat: number;
  location_lng: number;
  base_score: number;
  dynamic_score: number;
  total_score: number;
}

export interface ThemeCount {
  theme: string;
  count: number;
}

export interface Hotspot {
  lat: number;
  lng: number;
  weight: number;
}

export interface DashboardStatsType {
  total_submissions: number;
  top_themes: ThemeCount[];
  hotspot_locations: Hotspot[];
}

export interface Submission {
  id: number;
  text_content: string;
  original_language: string;
  extracted_theme: string | null;
  sentiment: string | null;
  urgency_score: number;
  location_lat: number | null;
  location_lng: number | null;
  created_at: string;
}
