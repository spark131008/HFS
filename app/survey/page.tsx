'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

interface FormData {
  butterChickenTexture: string;
  butterChickenSauce: string;
  butterChickenComments: string;
  mangoLassiFreshness: string;
  mangoLassiSweetness: string;
  mangoLassiComments: string;
}

interface CustomChangeEvent {
  target: {
    name: keyof FormData;
    value: string;
  };
}

export default function SurveyPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    butterChickenTexture: '',
    butterChickenSauce: '',
    butterChickenComments: '',
    mangoLassiFreshness: '',
    mangoLassiSweetness: '',
    mangoLassiComments: ''
  });

  const handleInputChange = (
    e: CustomChangeEvent | React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name as keyof FormData]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Prepare the data for Supabase according to table structure
      const surveyData = {
        location: 'Jayanagar',
        menu_item1: 'Butter Chicken',
        m1_q1: formData.butterChickenTexture,
        m1_q2: formData.butterChickenSauce,
        m1_q3: formData.butterChickenComments || null,
        menu_item2: 'Mango Lassi',
        m2_q1: formData.mangoLassiFreshness,
        m2_q2: formData.mangoLassiSweetness,
        m2_q3: formData.mangoLassiComments || null,
        m1_sentiment: getSentiment(formData.butterChickenTexture, formData.butterChickenSauce),
        m2_sentiment: getSentiment(formData.mangoLassiFreshness, formData.mangoLassiSweetness),

        // response_date will be set by default in the database
      };

      const { error: supabaseError } = await supabase
        .from('survey_responses')
        .insert([surveyData]);

      if (supabaseError) throw supabaseError;

      // Redirect to a thank you page or show success message
      router.push('/thank-you');
    } catch (err) {
      console.error('Error submitting survey:', err);
      setError('Failed to submit survey. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to determine basic sentiment
  const getSentiment = (...responses: string[]) => {
    const positiveResponses = [
      'Perfectly tender',
      'Perfectly balanced',
      'Very fresh and tasty',
      'Just right'
    ];
    
    const negativeResponses = [
      'Too soft/mushy',
      'Too dry',
      'Not fresh at all',
      'Too spicy',
      'Too bland'
    ];

    const totalResponses = responses.filter(r => r).length;
    const positiveCount = responses.filter(r => positiveResponses.includes(r)).length;
    const negativeCount = responses.filter(r => negativeResponses.includes(r)).length;

    if (positiveCount / totalResponses > 0.5) return 'Positive';
    if (negativeCount / totalResponses > 0.5) return 'Negative';
    return 'Neutral';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-50 p-8">
      <div className="container mx-auto max-w-3xl">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-800 font-display tracking-tight mb-3 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            Empire Restaurant Feedback
          </h1>
          <p className="text-lg text-gray-600 font-normal">
            Help us serve you better by sharing your dining experience
          </p>
        </div>
        
        {error && (
          <div className="mb-6 p-4 text-red-700 bg-red-100 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <Card className="border-none shadow-xl bg-gradient-to-br from-indigo-50/80 to-white/90 hover:shadow-2xl transition-shadow duration-300 rounded-2xl">
            <CardHeader className="pb-4 border-b border-indigo-100/50">
              <CardTitle className="text-2xl font-display text-indigo-900 flex items-center gap-3">
                <span className="text-3xl">🍗</span>
                <div>
                  <h3 className="font-bold">Butter Chicken</h3>
                  <p className="text-sm font-normal text-indigo-600/70">Main Course</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 p-6">
              <div className="space-y-3">
                <Label className="text-lg font-bold flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 text-sm font-semibold">
                    Q1
                  </span>
                  How was the texture of the butter chicken?
                </Label>
                <RadioGroup
                  name="butterChickenTexture"
                  onValueChange={(value: string) => 
                    handleInputChange({ 
                      target: { 
                        name: 'butterChickenTexture', 
                        value 
                      } 
                    } as CustomChangeEvent)
                  }
                >
                  {['Perfectly tender', 'A bit too dry', 'Too soft/mushy'].map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={`texture-${option}`} />
                      <Label htmlFor={`texture-${option}`}>{option}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label className="text-lg font-bold flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 text-sm font-semibold">
                    Q2
                  </span>
                  How was the sauce taste?
                </Label>
                <RadioGroup
                  name="butterChickenSauce"
                  onValueChange={(value: string) => 
                    handleInputChange({ 
                      target: { 
                        name: 'butterChickenSauce', 
                        value 
                      } 
                    } as CustomChangeEvent)
                  }
                >
                  {['Perfectly balanced', 'Too rich/heavy', 'Too spicy', 'Too bland', 'Too tangy'].map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={`sauce-${option}`} />
                      <Label htmlFor={`sauce-${option}`}>{option}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label htmlFor="butterChickenComments">Additional Comments</Label>
                <Textarea
                  id="butterChickenComments"
                  name="butterChickenComments"
                  onChange={handleInputChange}
                  placeholder="Share your thoughts..."
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl bg-gradient-to-br from-indigo-50/80 to-white/90 hover:shadow-2xl transition-shadow duration-300 rounded-2xl">
            <CardHeader className="pb-4 border-b border-indigo-100/50">
              <CardTitle className="text-2xl font-display text-indigo-900 flex items-center gap-3">
                <span className="text-3xl">🥤</span>
                <div>
                  <h3 className="font-bold">Mango Lassi</h3>
                  <p className="text-sm font-normal text-indigo-600/70">Beverage</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 p-6">
              <div className="space-y-3">
                <Label className="text-lg font-bold flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 text-sm font-semibold">
                    Q1
                  </span>
                  How was the freshness of your mango lassi?
                </Label>
                <RadioGroup
                  name="mangoLassiFreshness"
                  onValueChange={(value: string) => 
                    handleInputChange({ 
                      target: { 
                        name: 'mangoLassiFreshness', 
                        value 
                      } 
                    } as CustomChangeEvent)
                  }
                >
                  {['Very fresh and tasty', 'Tasted slightly off', 'Not fresh at all'].map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={`freshness-${option}`} />
                      <Label htmlFor={`freshness-${option}`}>{option}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label className="text-lg font-bold flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 text-sm font-semibold">
                    Q2
                  </span>
                  How was the sugar level?
                </Label>
                <RadioGroup
                  name="mangoLassiSweetness"
                  onValueChange={(value: string) => 
                    handleInputChange({ 
                      target: { 
                        name: 'mangoLassiSweetness', 
                        value 
                      } 
                    } as CustomChangeEvent)
                  }
                >
                  {['Just right', 'Too sweet', 'Not sweet enough'].map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={`sweetness-${option}`} />
                      <Label htmlFor={`sweetness-${option}`}>{option}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label htmlFor="mangoLassiComments">Additional Comments</Label>
                <Textarea
                  id="mangoLassiComments"
                  name="mangoLassiComments"
                  onChange={handleInputChange}
                  placeholder="Share your thoughts..."
                />
              </div>
            </CardContent>
          </Card>

          <Button 
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-6 rounded-xl font-medium text-lg shadow-lg transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Submitting...</span>
              </div>
            ) : (
              'Submit Feedback'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}