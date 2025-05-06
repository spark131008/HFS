import { createClient } from "@/utils/supabase/server";
import MySurveysClient from "./client";
import { theme, cn } from "@/theme";

// Define survey interface
interface Survey {
  id: string;
  title: string;
  location: string; // Added location field
  created_at: string;
  responses_count: number;
  status: string; // 'active', 'active-ready', or 'draft'
}

export default async function MySurveysPage() {
  const supabase = await createClient();
  
  // Check authentication
  const { data: { session } } = await supabase.auth.getSession();
  
  // If not authenticated, show login message instead of redirecting
  if (!session) {
    return (
      <MySurveysClient initialSurveys={[]} />
    );
  }
  
  // Get verified user data from Auth server
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return (
      <MySurveysClient initialSurveys={[]} />
    );
  }

  const { data: surveys }: { data: Survey[] | null} = await supabase
    .from('survey')
    .select(`
        id, 
        title,
        location,
        created_at,
        status
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .then(result => {
        // Transform the result to match your Survey interface
        return {
          data: result.data?.map((item) => ({
            id: item.id,
            title: item.title,
            location: item.location || '',  // Add location with fallback
            created_at: item.created_at,
            responses_count: 1,  // Fixed value of 1 for all surveys
            status: item.status || 'draft' // Use the actual status from database
          })) || null
        };
      });
  
  return <MySurveysClient initialSurveys={surveys || []} />;
}