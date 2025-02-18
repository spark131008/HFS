"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/app/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/app/components/ui/radio-group"
import { Textarea } from "@/app/components/ui/textarea"
import { Card, CardHeader, CardTitle, CardContent } from "@/app/components/ui/card"

const formSchema = z.object({
  butterChickenTexture: z.string(),
  butterChickenSauce: z.string(),
  butterChickenComments: z.string().optional(),
  mangoLassiFreshness: z.string(),
  mangoLassiSweetness: z.string(),
  mangoLassiComments: z.string().optional(),
})

export default function SurveyPage() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
    // Handle form submission
  }

  return (
    <div className="container mx-auto py-10">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Butter Chicken</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="butterChickenTexture"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>1️⃣ How was the texture of the butter chicken?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="perfectly-tender" />
                          </FormControl>
                          <FormLabel className="font-normal">Perfectly tender</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="too-dry" />
                          </FormControl>
                          <FormLabel className="font-normal">A bit too dry</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="too-soft" />
                          </FormControl>
                          <FormLabel className="font-normal">Too soft/mushy</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="butterChickenSauce"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>2️⃣ How was the sauce taste?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        {[
                          { value: "perfectly-balanced", label: "Perfectly balanced" },
                          { value: "too-rich", label: "Too rich/heavy" },
                          { value: "too-spicy", label: "Too spicy" },
                          { value: "too-bland", label: "Too bland" },
                          { value: "too-tangy", label: "Too tangy" },
                        ].map((option) => (
                          <FormItem key={option.value} className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value={option.value} />
                            </FormControl>
                            <FormLabel className="font-normal">{option.label}</FormLabel>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="butterChickenComments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Comments</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Share your thoughts..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mango Lassi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="mangoLassiFreshness"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>1️⃣ How was the freshness of your mango lassi?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="very-fresh" />
                          </FormControl>
                          <FormLabel className="font-normal">Very fresh and tasty</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="slightly-off" />
                          </FormControl>
                          <FormLabel className="font-normal">Tasted slightly off</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="not-fresh" />
                          </FormControl>
                          <FormLabel className="font-normal">Not fresh at all</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mangoLassiSweetness"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>2️⃣ How was the sugar level?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="just-right" />
                          </FormControl>
                          <FormLabel className="font-normal">Just right</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="too-sweet" />
                          </FormControl>
                          <FormLabel className="font-normal">Too sweet</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="not-sweet-enough" />
                          </FormControl>
                          <FormLabel className="font-normal">Not sweet enough</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mangoLassiComments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Comments</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Share your thoughts..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Button type="submit">Submit Feedback</Button>
        </form>
      </Form>
    </div>
  )
}
