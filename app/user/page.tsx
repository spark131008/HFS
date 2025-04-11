import { createClient } from "@/utils/supabase/server";
import { Button } from "@/components/ui/button";
import MainNavigationBar from "@/components/MainNavigationBar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Plus, BarChart3, Clock, Users, CheckCircle, XCircle } from "lucide-react";

// Define survey interface
interface Survey {
  id: string;
  title: string;
  created_at: string;
  responses_count: number;
  active: boolean; // Added active property
}

export default async function UserPage() {
  const supabase = await createClient();
  
  // Check authentication
  const { data: { session } } = await supabase.auth.getSession();
  
  // If not authenticated, show login message instead of redirecting
  if (!session) {
    return (
      <div className="min-h-screen flex flex-col">
        <MainNavigationBar />
        <main className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="w-full max-w-md mx-auto px-4 py-12 text-center">
            <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200">
              <div className="mx-auto mb-6 rounded-full bg-blue-100 p-5 w-20 h-20 flex items-center justify-center">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-10 w-10 text-blue-600" 
                  fill="none" 
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-4V7a3 3 0 00-3-3H6a3 3 0 00-3 3v5a3 3 0 003 3h6a3 3 0 003-3z" 
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold tracking-tight mb-3 text-blue-600">Authentication Required</h2>
              <p className="text-gray-600 mb-6">
                This page is only available after you sign up or log in. Please log in to access your surveys.
              </p>
              <Button size="lg" className="w-full" asChild>
                <Link href="/login">Sign up / Log in</Link>
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }
  
  // Get verified user data from Auth server
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <MainNavigationBar />
        <main className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="w-full max-w-md mx-auto px-4 py-12 text-center">
            <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200">
              <div className="mx-auto mb-6 rounded-full bg-blue-100 p-5 w-20 h-20 flex items-center justify-center">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-10 w-10 text-blue-600" 
                  fill="none" 
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-4V7a3 3 0 00-3-3H6a3 3 0 00-3 3v5a3 3 0 003 3h6a3 3 0 003-3z" 
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold tracking-tight mb-3 text-blue-600">Authentication Required</h2>
              <p className="text-gray-600 mb-6">
                This page is only available after you sign up or log in. Please log in to access your surveys.
              </p>
              <Button size="lg" className="w-full" asChild>
                <Link href="/login">Sign up / Log in</Link>
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
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
          data: result.data?.map((item, index) => ({
            id: item.id,
            title: item.title,
            created_at: item.created_at,
            responses_count: 1,  // Fixed value of 1 for all surveys
            active: index % 3 !== 0 // For demo: make every third survey inactive
          })) || null
        };
      });

  // Separate active and inactive surveys
  const activeSurveys = surveys?.filter(survey => survey.active) || [];
  const inactiveSurveys = surveys?.filter(survey => !survey.active) || [];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <MainNavigationBar />
     
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-blue-600 mb-2">My Surveys</h1>
            <p className="text-gray-600">
              Welcome back! Manage your surveys and track feedback insights.
            </p>
          </div>

          {/* Quick stats section */}
          {surveys && surveys.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-gradient-to-br from-blue-50 to-white border border-blue-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium text-blue-700 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                    Active Surveys
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-blue-600">{activeSurveys.length}</p>
                  <p className="text-sm text-gray-600">Currently collecting responses</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-blue-50 to-white border border-blue-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium text-blue-700 flex items-center">
                    <XCircle className="h-5 w-5 mr-2 text-gray-500" />
                    Inactive Surveys
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-blue-600">{inactiveSurveys.length}</p>
                  <p className="text-sm text-gray-600">Paused or completed</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-blue-50 to-white border border-blue-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium text-blue-700 flex items-center">
                    <Users className="h-5 w-5 mr-2 text-blue-500" />
                    Total Responses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-blue-600">{surveys.reduce((sum, survey) => sum + survey.responses_count, 0)}</p>
                  <p className="text-sm text-gray-600">From all surveys</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Create new survey button (always visible) */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">All Surveys</h2>
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700" asChild>
              <Link href="/new-survey" className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create New Survey
              </Link>
            </Button>
          </div>

          {surveys && surveys.length > 0 ? (
            <>
              {/* Active Surveys Section */}
              {activeSurveys.length > 0 && (
                <>
                  <h3 className="text-xl font-medium text-gray-700 mb-4 mt-8 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                    Active Surveys
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                    {activeSurveys.map((survey) => (
                      <Card key={survey.id} className="hover:shadow-md transition-all duration-200 border border-gray-200 bg-white overflow-hidden">
                        <div className="h-2 bg-green-500"></div>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-xl text-blue-600 line-clamp-1">{survey.title}</CardTitle>
                          <CardDescription className="flex items-center text-sm">
                            <Clock className="h-4 w-4 mr-1 opacity-70" />
                            Created on {new Date(survey.created_at).toLocaleDateString()}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-gray-500" />
                            <p className="text-gray-600 text-sm">{survey.responses_count} responses received</p>
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-between pt-2 border-t border-gray-100">
                          <Button variant="outline" size="sm" className="w-[48%]" asChild>
                            <Link href={`/survey/${survey.id}`}>
                              <BarChart3 className="h-4 w-4 mr-1" />
                              Results
                            </Link>
                          </Button>
                          <Button size="sm" className="w-[48%] bg-blue-600 hover:bg-blue-700" asChild>
                            <Link href={`/survey/${survey.id}/edit`}>
                              Edit
                            </Link>
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </>
              )}

              {/* Inactive Surveys Section */}
              {inactiveSurveys.length > 0 && (
                <>
                  <h3 className="text-xl font-medium text-gray-700 mb-4 mt-8 flex items-center">
                    <XCircle className="h-5 w-5 mr-2 text-gray-500" />
                    Inactive Surveys
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {inactiveSurveys.map((survey) => (
                      <Card key={survey.id} className="hover:shadow-md transition-all duration-200 border border-gray-200 bg-white overflow-hidden opacity-90">
                        <div className="h-2 bg-gray-400"></div>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-xl text-gray-700 line-clamp-1">{survey.title}</CardTitle>
                          <CardDescription className="flex items-center text-sm">
                            <Clock className="h-4 w-4 mr-1 opacity-70" />
                            Created on {new Date(survey.created_at).toLocaleDateString()}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-gray-500" />
                            <p className="text-gray-600 text-sm">{survey.responses_count} responses received</p>
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-between pt-2 border-t border-gray-100">
                          <Button variant="outline" size="sm" className="w-[48%]" asChild>
                            <Link href={`/survey/${survey.id}`}>
                              <BarChart3 className="h-4 w-4 mr-1" />
                              Results
                            </Link>
                          </Button>
                          <Button size="sm" className="w-[48%] bg-gray-600 hover:bg-gray-700" asChild>
                            <Link href={`/survey/${survey.id}/edit`}>
                              Edit
                            </Link>
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-10 text-center">
              <div className="mx-auto mb-6 rounded-full bg-blue-100 p-5 w-20 h-20 flex items-center justify-center">
                <Plus className="h-10 w-10 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight mb-3 text-blue-600">No surveys yet</h2>
              <p className="text-gray-600 max-w-md mx-auto mb-6">
                Create your first survey to start collecting valuable feedback from your customers.
              </p>
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700" asChild>
                <Link href="/new-survey" className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Create New Survey
                </Link>
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}