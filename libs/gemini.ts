import axios from "axios";

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-3-flash-preview";

const SYSTEM_INSTRUCTION = `You are an expert nutritionist and dietitian with deep knowledge of food science, macronutrients, and caloric density. Your task is to analyze the meal or food items provided by the user and estimate their nutritional profile as accurately as possible.

CRITICAL INSTRUCTIONS:
1. You must respond STRICTLY and ONLY with a valid JSON object.
2. Do not include any greetings, conversational filler, or markdown formatting (do NOT use \`\`\`json or \`\`\` tags). Just output the raw JSON object.
3. If a meal's portion size is not specified, assume a standard average serving size for an adult.
4. All macro values must include their standard units (e.g., "kcal" for calories, "g" for macros).

Your JSON output must exactly match the following structure:
{
  "name": "<A concise name for the meal, e.g., 'Grilled Chicken Salad'>",
  "calories": "<number> kcal",
  "protein": "<number> g",
  "carbs": "<number> g",
  "fats": "<number> g",
  "evaluation": "<A brief, 1-2 sentence professional evaluation of the meal's nutritional balance and health impact>"
}`;

export async function fetchGains(prompt: string): Promise<string> {
  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      system_instruction: {
        parts: [{ text: SYSTEM_INSTRUCTION }],
      },
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    },
  );
  return response.data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}
