/**
 * Standardized Operational Check Questions
 *
 * These 8 questions cover essential operational quality categories
 * based on restaurant operational excellence standards.
 *
 * All questions use binary "Satisfied" / "Not Satisfied" responses.
 */

export interface OperationalQuestion {
  id: number;
  category: string;
  question_text: string;
  options: string[];
  defaultImage: string; // Path to default image in public folder
}

export const OPERATIONAL_QUESTIONS: OperationalQuestion[] = [
  {
    id: 1,
    category: "Exterior & Patio",
    question_text: "Was the exterior and patio clean and ready?",
    options: ["Not Satisfied", "Satisfied"],
    defaultImage: "/operational/exterior.png"
  },
  {
    id: 2,
    category: "Interior Presentation",
    question_text: "Was the interior well-presented?",
    options: ["Not Satisfied", "Satisfied"],
    defaultImage: "/operational/interior.png"
  },
  {
    id: 3,
    category: "Welcome",
    question_text: "Did you receive a warm welcome?",
    options: ["Not Satisfied", "Satisfied"],
    defaultImage: "/operational/welcome.png"
  },
  {
    id: 4,
    category: "Staff Service",
    question_text: "Was the staff friendly and knowledgeable?",
    options: ["Not Satisfied", "Satisfied"],
    defaultImage: "/operational/staff-service.png"
  },
  {
    id: 5,
    category: "Restroom Cleanliness",
    question_text: "Were the restrooms clean and well-maintained?",
    options: ["Not Satisfied", "Satisfied"],
    defaultImage: "/operational/restroom.png"
  },
  {
    id: 6,
    category: "Food Safety",
    question_text: "Did staff follow food safety practices?",
    options: ["Not Satisfied", "Satisfied"],
    defaultImage: "/operational/food-safety.png"
  },
  {
    id: 7,
    category: "Ambience",
    question_text: "Was the ambience comfortable?",
    options: ["Not Satisfied", "Satisfied"],
    defaultImage: "/operational/ambience.png"
  },
  {
    id: 8,
    category: "Staff Care",
    question_text: "Did staff show genuine care?",
    options: ["Not Satisfied", "Satisfied"],
    defaultImage: "/operational/staff-care.png"
  }
];

/**
 * Helper function to get operational questions count
 */
export const OPERATIONAL_QUESTIONS_COUNT = OPERATIONAL_QUESTIONS.length;

/**
 * Helper function to validate if a survey is operational type
 */
export function isOperationalSurvey(surveyType: string | null | undefined): boolean {
  return surveyType === 'operational';
}
