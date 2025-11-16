import { createClient } from "@/utils/supabase/server";
import MySurveysClient from "./client";
import { redirect } from "next/navigation";

// Define survey interface
interface Survey {
  id: string;
  title: string;
  location: string; // Added location field
  created_at: string;
  responses_count: number;
  status: string; // 'active', 'active-ready', or 'draft'
  survey_type?: string; // 'custom' or 'operational'
}

// Define the response count interface for our RPC function
interface ResponseCount {
  survey_id: number; // Changed to number type since IDs are numeric
  count: number;
}

export default async function MySurveysPage() {
  const supabase = await createClient();
  
  // Check authentication
  const { data: { session } } = await supabase.auth.getSession();
  
  // Redirect to login page if not authenticated
  if (!session) {
    redirect('/login');
  }
  
  // Get verified user data from Auth server
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // First get all surveys for this user
  const { data: surveyData } = await supabase
    .from('survey')
    .select(`
        id,
        title,
        location,
        created_at,
        status,
        survey_type
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (!surveyData || surveyData.length === 0) {
    return <MySurveysClient initialSurveys={[]} />;
  }

  // Get response counts for each survey using the RPC function we created
  // Convert string IDs to numbers if needed
  const surveyIds = surveyData.map(survey => Number(survey.id));
  
  const { data: responseCounts, error } = await supabase
    .rpc('get_survey_response_counts', { survey_ids: surveyIds });

  if (error) {
    console.error("Error fetching response counts:", error);
  }

  // Create a map of survey IDs to response counts
  const responseCountMap = new Map<number, number>();
  
  if (responseCounts) {
    responseCounts.forEach((item: ResponseCount) => {
      responseCountMap.set(item.survey_id, item.count);
    });
  }

  // Transform the survey data to include the correct response counts
  const surveys: Survey[] = surveyData.map(item => ({
    id: item.id,
    title: item.title,
    location: item.location || '',
    created_at: item.created_at,
    responses_count: responseCountMap.get(Number(item.id)) || 0, // Use the actual count or 0 if none
    status: item.status || 'draft',
    survey_type: item.survey_type || 'custom'
  }));
  
  return <MySurveysClient initialSurveys={surveys} />;
}