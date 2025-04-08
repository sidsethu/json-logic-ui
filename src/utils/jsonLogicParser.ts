import jsonLogic from 'json-logic-js';

interface JsonLogicRule {
  [key: string]: any;
}

// Configuration for Azure OpenAI endpoint
const AZURE_ENDPOINT = process.env.AZURE_ENDPOINT || '';
const AZURE_API_KEY = process.env.AZURE_API_KEY || '';

console.log('Debug - Environment Variables:', {
  endpoint: AZURE_ENDPOINT,
  apiKey: AZURE_API_KEY ? 'Present' : 'Missing',
  constructedUrl: `${AZURE_ENDPOINT}/openai/deployments/gpt-4/chat/completions?api-version=2023-08-01-preview`
});

const REQUEST_TIMEOUT = 30000; // 30 seconds timeout

export const validateJsonLogic = (logic: JsonLogicRule, data?: any): boolean => {
  try {
    if (data) {
      return jsonLogic.apply(logic, data);
    }
    return true; // If no data provided, just validate the structure
  } catch (error) {
    throw new Error('Invalid JSON Logic structure');
  }
};

export const generateJsonLogic = async (prompt: string): Promise<JsonLogicRule> => {
  try {
    console.log('Sending request to Azure OpenAI...');
    
    // Create an AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    const response = await fetch(`${AZURE_ENDPOINT}/openai/deployments/gpt-4/chat/completions?api-version=2023-08-01-preview`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': AZURE_API_KEY
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: "You are a JSON Logic expert. Convert natural language conditions into valid JSON Logic format. Return only the JSON object without any explanation."
          },
          {
            role: "user",
            content: `Convert this natural language condition into JSON Logic format:

${prompt}

Rules:
1. Use standard JSON Logic operators (==, !=, >, <, >=, <=, in, nin, and, or, not)
2. Always use the "var" operator for variable references
3. Handle numeric values appropriately
4. Support array operations for 'in' and 'nin' operators
5. Support logical operators (and, or, not)

Example:
Input: "age is greater than 18 and country is USA"
Output: {"and":[{" >":[{"var":"age"},18]},{"==":[{"var":"country"},"USA"]}]}`
          }
        ],
        temperature: 0,
        max_tokens: 500
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Azure OpenAI error:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Azure OpenAI response:', data);
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response from Azure OpenAI');
    }

    const generatedText = data.choices[0].message.content;
    console.log('Generated text:', generatedText);

    // Extract JSON from the response (in case the model includes additional text)
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON found in response:', generatedText);
      throw new Error('No valid JSON found in response');
    }

    // Parse the response as JSON
    const jsonLogic = JSON.parse(jsonMatch[0]);
    console.log('Parsed JSON Logic:', jsonLogic);
    
    // Validate the generated JSON Logic
    validateJsonLogic(jsonLogic);
    
    return jsonLogic;
  } catch (error) {
    console.error('Error generating JSON Logic:', error);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please try again.');
      }
      throw new Error(error.message);
    }
    
    throw new Error('Failed to generate JSON Logic. Please try again with different wording.');
  }
}; 