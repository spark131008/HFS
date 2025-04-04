import { createClient } from "@/utils/supabase/server";
import { Button } from "@/components/ui/button";
import MainNavigationBar from "@/components/MainNavigationBar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";

// Define survey interface
interface Survey {
  id: string;
  title: string;
  created_at: string;
  responses_count: number;
}

export default async function UserPage() {
  const supabase = await createClient();
  


  // Check authentication
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect("/login");
  }
  
  // Get verified user data from Auth server
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
 }

  const { data: surveys }: { data: Survey[] | null} = await supabase
    .from('survey')
    .select(`
        id, 
        title, 
        created_at
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .then(result => {
        // Transform the result to match your Survey interface
        return {
          data: result.data?.map(item => ({
            id: item.id,
            title: item.title,
            created_at: item.created_at,
            responses_count: 1  // Fixed value of 1 for all surveys
          })) || null
        };
      });

  return (
    <>
      <div className="sticky top-0 z-50 w-full border-b backdrop-blur">
        <MainNavigationBar />
      </div>
     
      <div className="container py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">My Surveys</h1>
          <p className="text-muted-foreground mt-2">
            View and manage your feedback surveys
          </p>
        </div>

        {surveys && surveys.length > 0 ? (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {surveys.map((survey) => (
                <Card key={survey.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle>{survey.title}</CardTitle>
                    <CardDescription>
                      Created on {new Date(survey.created_at).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>{survey.responses_count} responses received</p>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" asChild>
                      <Link href={`/survey/${survey.id}`}>View Results</Link>
                    </Button>
                    <Button asChild>
                      <Link href={`/survey/${survey.id}/edit`}>Edit</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
              {/* Create new survey card */}
              <Card className="border-dashed hover:border-primary/50 hover:shadow-md transition-all">
                <CardHeader className="flex items-center justify-center h-[220px]">
                  <Link href="/survey/create">
                    <Button variant="ghost" size="lg" className="h-24 w-24 rounded-full">
                      <Plus className="h-12 w-12" />
                    </Button>
                    <p className="text-center mt-4 font-medium">Create New Survey</p>
                  </Link>
                </CardHeader>
              </Card>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-6 rounded-full bg-primary/10 p-6">
              <Plus className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight mb-2">No surveys yet</h2>
            <p className="text-muted-foreground max-w-md mb-8">
              Create your first survey to start collecting valuable feedback from your customers.
            </p>
            <Button size="lg" asChild>
              <Link href="/survey/create">Create New Survey</Link>
            </Button>
          </div>
        )}
      </div>
    </>
  );
}