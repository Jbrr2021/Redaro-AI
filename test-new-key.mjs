import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: 'AIzaSyBI7EW-S5q1r5vp7dUrJVmVKbf0WJwVmBg'
});

try {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [{ text: 'Teste de validação de chave API.' }]
    }
  });
  console.log('SUCCESS', response.text);
} catch (error) {
  console.error('ERROR', error);
}
