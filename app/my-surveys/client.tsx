'use client'

import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import MainNavigationBar from "@/components/MainNavigationBar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Plus, BarChart3, Clock, Users, CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

// Define survey interface for client component
interface SurveyProps {
  initialSurveys: {
    id: string;
    title: string;
    location: string; // Added location field
    created_at: string;
    responses_count: number;
    status: string; // 'active', 'active-ready', or 'draft'
  }[];
}

export default function MySurveysClient({ initialSurveys }: SurveyProps) {
  const router = useRouter();
  const [surveys, setSurveys] = useState(initialSurveys);
  const [activatingSurveyId, setActivatingSurveyId] = useState<string | null>(null);
  const [deactivatingSurveyId, setDeactivatingSurveyId] = useState<string | null>(null);
  
  // Separate active and inactive surveys
  const activeSurveys = surveys?.filter(survey => survey.status === 'active') || [];
  const inactiveSurveys = surveys?.filter(survey => survey.status !== 'active') || [];

  const activateSurvey = async (surveyId: string) => {
    try {
      setActivatingSurveyId(surveyId);
      
      const supabase = createClient();
      
      // Find any currently active survey
      const currentlyActiveSurvey = surveys.find(survey => survey.status === 'active');
      
      // If there's an active survey and it's not the one we're trying to activate
      if (currentlyActiveSurvey && currentlyActiveSurvey.id !== surveyId) {
        // Change the currently active survey to active-ready
        const { error: deactivateError } = await supabase
          .from('survey')
          .update({ status: 'active-ready' })
          .eq('id', currentlyActiveSurvey.id);
          
        if (deactivateError) {
          console.error('Error deactivating current survey:', deactivateError);
          alert('Failed to manage survey statuses. Please try again.');
          return;
        }
      }
      
      // Update the selected survey status to active
      const { error } = await supabase
        .from('survey')
        .update({ status: 'active' })
        .eq('id', surveyId);
        
      if (error) {
        console.error('Error activating survey:', error);
        alert('Failed to activate survey. Please try again.');
        return;
      }
      
      // Update local state
      setSurveys(prevSurveys => 
        prevSurveys.map(survey => {
          if (survey.id === surveyId) {
            return { ...survey, status: 'active' };
          } else if (survey.status === 'active') {
            // Change any other active survey to active-ready
            return { ...survey, status: 'active-ready' };
          }
          return survey;
        })
      );
      
      // Refresh the page to reflect changes
      router.refresh();
      
    } catch (error) {
      console.error('Unexpected error activating survey:', error);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setActivatingSurveyId(null);
    }
  };

  const deactivateSurvey = async (surveyId: string) => {
    try {
      setDeactivatingSurveyId(surveyId);
      
      const supabase = createClient();
      
      // Update the survey status to active-ready
      const { error } = await supabase
        .from('survey')
        .update({ status: 'active-ready' })
        .eq('id', surveyId);
        
      if (error) {
        console.error('Error deactivating survey:', error);
        alert('Failed to deactivate survey. Please try again.');
        return;
      }
      
      // Update local state
      setSurveys(prevSurveys => 
        prevSurveys.map(survey => {
          if (survey.id === surveyId) {
            return { ...survey, status: 'active-ready' };
          }
          return survey;
        })
      );
      
      // Refresh the page to reflect changes
      router.refresh();
      
    } catch (error) {
      console.error('Unexpected error deactivating survey:', error);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setDeactivatingSurveyId(null);
    }
  };

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
              <Link href="/survey-creation" className="flex items-center gap-2">
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
                          <CardTitle className="text-xl text-blue-600 line-clamp-1">
                            {survey.title}{survey.location ? ` in ${survey.location}` : ''}
                          </CardTitle>
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
                          <div className="mt-2 text-sm text-green-700 bg-green-50 px-3 py-1 rounded-md flex justify-between items-center">
                            <span>This survey is currently active</span>
                            <Button 
                              size="sm" 
                              className="bg-gray-600 hover:bg-gray-700 ml-2"
                              onClick={() => deactivateSurvey(survey.id)}
                              disabled={deactivatingSurveyId === survey.id}
                            >
                              {deactivatingSurveyId === survey.id ? 'Deactivating...' : 'Deactivate'}
                            </Button>
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
                            <Link href={`/survey-creation?edit=${survey.id}`}>
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
                      <Card key={survey.id} className={`hover:shadow-md transition-all duration-200 border border-gray-200 bg-white overflow-hidden ${survey.status === 'draft' ? 'opacity-75' : 'opacity-90'}`}>
                        <div className={`h-2 ${survey.status === 'active-ready' ? 'bg-yellow-400' : 'bg-gray-400'}`}></div>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-xl text-gray-700 line-clamp-1">
                              {survey.title}{survey.location ? ` in ${survey.location}` : ''}
                              {survey.status === 'draft' && (
                                <span className="ml-2 inline-block px-2 py-1 text-xs font-medium rounded bg-gray-200 text-gray-700">
                                  DRAFT
                                </span>
                              )}
                            </CardTitle>
                          </div>
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
                          {survey.status === 'active-ready' && (
                            <div className="mt-2 text-sm text-yellow-700 bg-yellow-50 px-3 py-1 rounded-md flex justify-between items-center">
                              <span>This survey is ready to be activated</span>
                              <Button 
                                size="sm" 
                                className="bg-green-600 hover:bg-green-700 ml-2"
                                onClick={() => activateSurvey(survey.id)}
                                disabled={activatingSurveyId === survey.id}
                              >
                                {activatingSurveyId === survey.id ? 'Activating...' : 'Activate'}
                              </Button>
                            </div>
                          )}
                          {survey.status === 'draft' && (
                            <div className="mt-2 text-sm text-gray-700 bg-gray-50 px-3 py-1 rounded-md">
                              Complete all requirements to activate
                            </div>
                          )}
                        </CardContent>
                        <CardFooter className="flex justify-between pt-2 border-t border-gray-100">
                          <Button variant="outline" size="sm" className="w-[48%]" asChild>
                            <Link href={`/survey/${survey.id}`}>
                              <BarChart3 className="h-4 w-4 mr-1" />
                              Results
                            </Link>
                          </Button>
                          <Button size="sm" className="w-[48%] bg-blue-600 hover:bg-blue-700" asChild>
                            <Link href={`/survey-creation?edit=${survey.id}`}>
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
                <Link href="/survey-creation" className="flex items-center gap-2">
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