import axios from "axios";
import * as SecureStore from "expo-secure-store";

const GEMINI_MODEL = "gemini-3-flash-preview";

export async function fetchGains(
  systemPrompt: string,
  userPrompt: string,
): Promise<string> {
  const GEMINI_API_KEY = await SecureStore.getItemAsync("geminiApiKey");
  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      system_instruction: {
        parts: [{ text: systemPrompt }],
      },
      contents: [
        {
          role: "user",
          parts: [{ text: userPrompt }],
        },
      ],
    },
  );
  return response.data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

export async function fetchGainsWithImage(
  systemPrompt: string,
  base64Image: string,
): Promise<string> {
  const GEMINI_API_KEY = await SecureStore.getItemAsync("geminiApiKey");
  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      system_instruction: {
        parts: [{ text: systemPrompt }],
      },
      contents: [
        {
          role: "user",
          parts: [
            { text: "Analyze the meal in this image." },
            { inlineData: { mimeType: "image/jpeg", data: base64Image } },
          ],
        },
      ],
    },
  );
  return response.data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}
