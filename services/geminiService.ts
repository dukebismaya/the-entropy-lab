
import { GoogleGenAI } from "@google/genai";

// IMPORTANT: In a real application, the API key would be handled securely
// and not exposed in the client-side code. This is for demonstration purposes only.
// The execution environment is expected to provide `process.env.API_KEY`.
if (!process.env.API_KEY) {
  console.warn("API_KEY environment variable not set. Using a placeholder. AI features will not work.");
  // Provide a mock for process.env in browser environments if it doesn't exist
  if (typeof process === 'undefined') {
    (window as any).process = { env: {} };
  }
  process.env.API_KEY = "YOUR_API_KEY_HERE"; 
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * A mock function to simulate the Gemini API call.
 * In a real scenario, this would make an actual API request.
 * Replace this with the actual API call when an API key is available.
 */
const mockGenerateContent = (prompt: string): Promise<string> => {
    console.log("--- MOCK GEMINI API CALL ---");
    console.log("Prompt:", prompt);
    return new Promise(resolve => {
        setTimeout(() => {
            if (prompt.includes("PowerShell installation script")) {
                const script = `# PowerShell Script to install the mod
# Ensure you are running this script from the directory containing the mod files.

$GameRoot = "C:\\Path\\To\\Your\\Game"
$ModName = "ModFiles" # The folder containing your mod files

# Destination path for the mod
$Destination = Join-Path $GameRoot "Mods"

# Create destination directory if it doesn't exist
if (-not (Test-Path $Destination)) {
    New-Item -ItemType Directory -Path $Destination
    Write-Host "Created directory: $Destination"
}

# Copy mod files
Write-Host "Copying mod files..."
Copy-Item -Path ".\\$ModName\\*" -Destination $Destination -Recurse -Force

Write-Host "Mod installation complete!"
`;
                resolve(script);
            } else {
                resolve(`This is a supercharged, AI-generated description based on your prompt. It highlights the core features in a dynamic and futuristic way, perfect for The Entropy Lab! The prompt was about: "${prompt.slice(prompt.indexOf('Title:'), 150)}..."`);
            }
        }, 1500);
    });
};


/**
 * Generates content using the Gemini API.
 * @param prompt The text prompt to send to the model.
 * @returns The generated text content.
 */
export const generateContent = async (prompt: string): Promise<string> => {
  // Use the mock function if the API key is a placeholder
  if (process.env.API_KEY === "YOUR_API_KEY_HERE") {
    return mockGenerateContent(prompt);
  }

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    // Fallback to mock on API error for a better demo experience
    return mockGenerateContent(prompt);
  }
};
