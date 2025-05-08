'use client'

import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import MainNavigationBar from "@/components/MainNavigationBar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Plus, BarChart3, Clock, Users, CheckCircle, XCircle, QrCode } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { theme, cn, componentStyles } from "@/theme";

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
  const inactiveSurveys = surveys?.filter(survey => survey.status !== 'active')
    .sort((a, b) => {
      // Sort "active-ready" before "draft"
      if (a.status === 'active-ready' && b.status !== 'active-ready') return -1;
      if (a.status !== 'active-ready' && b.status === 'active-ready') return 1;
      return 0;
    }) || [];

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
    <div className={cn("min-h-screen flex flex-col", theme.colors.background.gradient)}>
      <MainNavigationBar />
     
      <main className="flex-1">
        <div className={cn("max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10")}>
          <div className="mb-6 sm:mb-8">
            <h1 className={cn(
              theme.typography.fontFamily.display,
              theme.typography.fontWeight.bold,
              theme.typography.fontSize["3xl"],
              "tracking-tight mb-2",
              theme.colors.text.gradient
            )}>My Surveys</h1>
            <p className={cn(
              theme.typography.fontSize.base,
              theme.colors.text.secondary
            )}>
              Welcome back! Manage your surveys and track feedback insights.
            </p>
          </div>

          {/* Quick stats section */}
          {surveys && surveys.length > 0 && (
            <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
              <Card className={cn(
                "aspect-square sm:aspect-auto flex flex-col justify-center",
                "bg-gradient-to-br from-blue-50 to-white border border-blue-100"
              )}>
                <CardHeader className="pb-0 sm:pb-2 px-3 pt-3 text-center sm:text-left">
                  <CardTitle className={cn(
                    theme.typography.fontSize.sm,
                    theme.typography.fontWeight.medium,
                    "sm:text-base flex items-center justify-center sm:justify-start text-gray-700"
                  )}>
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    Active
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-3 py-2 text-center sm:text-left flex flex-col items-center sm:items-start justify-center">
                  <p className={cn(
                    theme.typography.fontSize["2xl"],
                    theme.typography.fontWeight.bold,
                    theme.colors.text.primary,
                    "sm:text-2xl"
                  )}>{activeSurveys.length}</p>
                  <p className={cn(
                    theme.typography.fontSize.xs,
                    theme.colors.text.secondary
                  )}>surveys</p>
                </CardContent>
              </Card>
              
              <Card className={cn(
                "aspect-square sm:aspect-auto flex flex-col justify-center",
                "bg-gradient-to-br from-blue-50 to-white border border-blue-100"
              )}>
                <CardHeader className="pb-0 sm:pb-2 px-3 pt-3 text-center sm:text-left">
                  <CardTitle className={cn(
                    theme.typography.fontSize.sm,
                    theme.typography.fontWeight.medium,
                    "sm:text-base flex items-center justify-center sm:justify-start text-gray-700"
                  )}>
                    <XCircle className="h-4 w-4 mr-2 text-gray-500" />
                    Inactive
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-3 py-2 text-center sm:text-left flex flex-col items-center sm:items-start justify-center">
                  <p className={cn(
                    theme.typography.fontSize["2xl"],
                    theme.typography.fontWeight.bold,
                    theme.colors.text.primary,
                    "sm:text-2xl"
                  )}>{inactiveSurveys.length}</p>
                  <p className={cn(
                    theme.typography.fontSize.xs,
                    theme.colors.text.secondary
                  )}>surveys</p>
                </CardContent>
              </Card>
              
              <Card className={cn(
                "aspect-square sm:aspect-auto flex flex-col justify-center",
                "bg-gradient-to-br from-blue-50 to-white border border-blue-100"
              )}>
                <CardHeader className="pb-0 sm:pb-2 px-3 pt-3 text-center sm:text-left">
                  <CardTitle className={cn(
                    theme.typography.fontSize.sm,
                    theme.typography.fontWeight.medium,
                    "sm:text-base flex items-center justify-center sm:justify-start text-gray-700"
                  )}>
                    <Users className="h-4 w-4 mr-2 text-blue-500" />
                    Responses
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-3 py-2 text-center sm:text-left flex flex-col items-center sm:items-start justify-center">
                  <p className={cn(
                    theme.typography.fontSize["2xl"],
                    theme.typography.fontWeight.bold,
                    theme.colors.text.primary,
                    "sm:text-2xl"
                  )}>{surveys.reduce((sum, survey) => sum + survey.responses_count, 0)}</p>
                  <p className={cn(
                    theme.typography.fontSize.xs,
                    theme.colors.text.secondary
                  )}>total</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Create new survey button (always visible) */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-4 sm:space-y-0">
            <h2 className={cn(
              theme.typography.fontFamily.display,
              theme.typography.fontWeight.semibold,
              theme.typography.fontSize.xl,
              theme.colors.text.primary
            )}>All Surveys</h2>
            <div className="flex flex-row gap-3">
              <Button size="lg" className={componentStyles.button.primary} asChild>
                <Link href="/qr" className="flex items-center justify-center gap-2">
                  <QrCode className="h-4 w-4 sm:h-5 sm:w-5" />
                  Show QR Code
                </Link>
              </Button>
              <Button size="lg" className={componentStyles.button.primary} asChild>
                <Link href="/survey-creation" className="flex items-center justify-center gap-2">
                  <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                  Create New Survey
                </Link>
              </Button>
            </div>
          </div>

          {surveys && surveys.length > 0 ? (
            <>
              {/* Active Surveys Section */}
              {activeSurveys.length > 0 && (
                <>
                  <h3 className={cn(
                    theme.typography.fontFamily.display,
                    theme.typography.fontWeight.medium,
                    theme.typography.fontSize.xl,
                    theme.colors.text.primary,
                    "mb-3 sm:mb-4 mt-6 sm:mt-8 flex items-center"
                  )}>
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-green-500" />
                    Active Surveys
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10">
                    {activeSurveys.map((survey) => (
                      <Card key={survey.id} className={cn(
                        "hover:shadow-md transition-all duration-200 border border-gray-200 bg-white overflow-hidden"
                      )}>
                        <div className={cn("h-2 sm:h-2 bg-green-500")}></div>
                        
                        <CardHeader className={cn("pb-2 pt-4 sm:pt-3 px-4 sm:px-6")}>
                          <div className={cn("flex justify-between items-center gap-2")}>
                            <CardTitle className={cn(
                              theme.typography.fontSize.xl,
                              theme.typography.fontWeight.medium,
                              theme.typography.fontFamily.display,
                              "text-gray-900 line-clamp-1 flex-1"
                            )}>
                              {survey.title}
                              <span className={cn("hidden sm:inline", theme.colors.text.secondary)}>{survey.location ? ` in ${survey.location}` : ''}</span>
                            </CardTitle>
                            
                            {/* Mobile deactivate button inline with title (visible only on mobile) */}
                            <div className={cn("sm:hidden")}>
                              <Button 
                                size="sm" 
                                className={cn(
                                  "bg-gray-600 hover:bg-gray-700 py-1 h-7 px-2 text-xs rounded-md whitespace-nowrap"
                                )}
                                onClick={() => deactivateSurvey(survey.id)}
                                disabled={deactivatingSurveyId === survey.id}
                              >
                                {deactivatingSurveyId === survey.id ? '...' : 'Deactivate'}
                              </Button>
                            </div>
                          </div>
                          
                          <CardDescription className={cn("sm:flex items-center text-xs sm:text-sm hidden", theme.colors.text.secondary)}>
                            <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1 opacity-70" />
                            Created on {new Date(survey.created_at).toLocaleDateString()}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className={cn("pb-3 px-4 sm:px-6")}>
                          <div className={cn("flex items-center gap-1 mb-3 sm:mb-0")}>
                            <Users className={cn("h-4 w-4 sm:h-3 sm:w-3 text-gray-500")} />
                            <p className={cn(
                              theme.typography.fontSize.sm,
                              theme.typography.fontWeight.medium,
                              theme.colors.text.secondary
                            )}>
                              <span className={cn("font-medium")}>{survey.responses_count}</span> responses
                            </p>
                          </div>
                          <div className={cn("mt-2 text-sm sm:text-xs text-green-700 bg-green-50 px-4 py-3 sm:py-2 rounded-md flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2")}>
                            <span className={cn("font-medium")}>Currently active</span>
                            {/* Desktop deactivate button (hidden on mobile) */}
                            <div className={cn("hidden sm:block")}>
                              <Button 
                                size="sm" 
                                className={cn(
                                  "bg-gray-600 hover:bg-gray-700 w-auto py-1 h-auto text-xs"
                                )}
                                onClick={() => deactivateSurvey(survey.id)}
                                disabled={deactivatingSurveyId === survey.id}
                              >
                                {deactivatingSurveyId === survey.id ? 'Working...' : 'Deactivate'}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className={cn("flex justify-between pt-2 px-4 sm:px-6 border-t border-gray-100")}>
                          <Button variant="outline" size="sm" className={cn("w-[48%] py-3 sm:py-1 h-auto text-sm sm:text-sm")} asChild>
                            <Link href={`/survey/${survey.id}`}>
                              <BarChart3 className={cn("h-4 w-4 sm:h-3 sm:w-3 mr-2 sm:mr-1")} />
                              Results
                            </Link>
                          </Button>
                          <Button size="sm" className={cn(
                            theme.effects.gradient.primary,
                            "w-[48%] py-3 sm:py-1 h-auto text-sm sm:text-sm"
                          )} asChild>
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
                  <h3 className={cn(
                    theme.typography.fontFamily.display,
                    theme.typography.fontWeight.medium,
                    theme.typography.fontSize.xl,
                    theme.colors.text.primary,
                    "mb-3 sm:mb-4 mt-6 sm:mt-8 flex items-center"
                  )}>
                    <XCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-gray-500" />
                    Inactive Surveys
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {inactiveSurveys.map((survey) => (
                      <Card key={survey.id} className={cn(
                        "hover:shadow-md transition-all duration-200 border border-gray-200 bg-white overflow-hidden",
                        survey.status === 'draft' ? "opacity-75" : "opacity-90"
                      )}>
                        <div className={cn(`h-2 ${survey.status === 'active-ready' ? 'bg-yellow-400' : 'bg-gray-400'}`)}></div>
                        
                        <CardHeader className={cn("pb-2 pt-4 sm:pt-3 px-4 sm:px-6")}>
                          <div className={cn("flex justify-between items-center gap-2")}>
                            <CardTitle className={cn(
                              theme.typography.fontSize.xl,
                              theme.typography.fontWeight.medium,
                              theme.typography.fontFamily.display,
                              "text-gray-900 line-clamp-1 flex-1"
                            )}>
                              {survey.title}
                              <span className={cn("hidden sm:inline", theme.colors.text.secondary)}>{survey.location ? ` in ${survey.location}` : ''}</span>
                              {survey.status === 'draft' && (
                                <span className={cn("ml-1 inline-block px-1 py-0.5 text-xxs sm:text-xs font-medium rounded bg-gray-200 text-gray-700 align-text-top")}>
                                  DRAFT
                                </span>
                              )}
                            </CardTitle>
                            
                            {/* Mobile activate button inline with title for active-ready surveys */}
                            {survey.status === 'active-ready' && (
                              <div className={cn("sm:hidden")}>
                                <Button 
                                  size="sm" 
                                  className={cn(
                                    "bg-green-600 hover:bg-green-700 py-1 h-7 px-2 text-xs rounded-md whitespace-nowrap"
                                  )}
                                  onClick={() => activateSurvey(survey.id)}
                                  disabled={activatingSurveyId === survey.id}
                                >
                                  {activatingSurveyId === survey.id ? '...' : 'Activate'}
                                </Button>
                              </div>
                            )}
                          </div>
                          
                          <CardDescription className={cn("sm:flex items-center text-xs sm:text-sm hidden", theme.colors.text.secondary)}>
                            <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1 opacity-70" />
                            Created on {new Date(survey.created_at).toLocaleDateString()}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className={cn("pb-3 px-4 sm:px-6")}>
                          <div className={cn("flex items-center gap-1 mb-3 sm:mb-0")}>
                            <Users className={cn("h-4 w-4 sm:h-3 sm:w-3 text-gray-500")} />
                            <p className={cn(
                              theme.typography.fontSize.sm,
                              theme.typography.fontWeight.medium,
                              theme.colors.text.secondary
                            )}>
                              <span className={cn("font-medium")}>{survey.responses_count}</span> responses
                            </p>
                          </div>
                          {survey.status === 'active-ready' && (
                            <div className={cn("mt-2 text-sm sm:text-xs text-yellow-700 bg-yellow-50 px-4 py-3 sm:py-2 rounded-md flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2")}>
                              <span className={cn("font-medium")}>Ready to activate</span>
                              {/* Desktop activate button (hidden on mobile) */}
                              <div className={cn("hidden sm:block")}>
                                <Button 
                                  size="sm" 
                                  className={cn(
                                    "bg-green-600 hover:bg-green-700 w-auto py-1 h-auto text-xs"
                                  )}
                                  onClick={() => activateSurvey(survey.id)}
                                  disabled={activatingSurveyId === survey.id}
                                >
                                  {activatingSurveyId === survey.id ? 'Working...' : 'Activate'}
                                </Button>
                              </div>
                            </div>
                          )}
                          {survey.status === 'draft' && (
                            <div className={cn("mt-2 text-sm sm:text-xs text-gray-700 bg-gray-50 px-4 py-3 sm:py-2 rounded-md")}>
                              <span className={cn("font-medium")}>Complete to activate</span>
                            </div>
                          )}
                        </CardContent>
                        <CardFooter className={cn("flex justify-between pt-2 px-4 sm:px-6 border-t border-gray-100")}>
                          <Button variant="outline" size="sm" className={cn("w-[48%] py-3 sm:py-1 h-auto text-sm sm:text-sm")} asChild>
                            <Link href={`/survey/${survey.id}`}>
                              <BarChart3 className={cn("h-4 w-4 sm:h-3 sm:w-3 mr-2 sm:mr-1")} />
                              Results
                            </Link>
                          </Button>
                          <Button size="sm" className={cn(
                            theme.effects.gradient.primary,
                            "w-[48%] py-3 sm:py-1 h-auto text-sm sm:text-sm"
                          )} asChild>
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
            <div className={cn("bg-white shadow-sm rounded-lg border border-gray-200 p-6 sm:p-10 text-center")}>
              <div className={cn("mx-auto mb-4 sm:mb-6 rounded-full bg-blue-100 p-3 sm:p-5 w-16 sm:w-20 h-16 sm:h-20 flex items-center justify-center")}>
                <Plus className={cn("h-8 w-8 sm:h-10 sm:w-10 text-blue-600")} />
              </div>
              <h2 className={cn(
                theme.typography.fontFamily.display,
                theme.typography.fontWeight.bold,
                theme.typography.fontSize.xl,
                "tracking-tight mb-2 sm:mb-3 text-gray-900"
              )}>No surveys yet</h2>
              <p className={cn(
                theme.typography.fontSize.base,
                theme.colors.text.secondary,
                "max-w-md mx-auto mb-4 sm:mb-6"
              )}>
                Create your first survey to start collecting valuable feedback from your customers.
              </p>
              <Button size="lg" className={componentStyles.button.primary} asChild>
                <Link href="/survey-creation" className="flex items-center justify-center gap-2">
                  <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
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