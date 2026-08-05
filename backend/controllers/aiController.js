import { GoogleGenerativeAI } from '@google/generative-ai';
import { ChatbotKnowledge } from '../models/ChatbotKnowledge.js';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Google Gemini API
const genAI = process.env.GEMINI_API_KEY 
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

// Standard photography categories allowed
const PHOTOGRAPHY_KEYWORDS = [
  'photo', 'video', 'camera', 'lens', 'focal length', 'aperture', 'shutter', 'iso',
  'exposure', 'composition', 'lighting', 'editing', 'lightroom', 'photoshop',
  'premiere', 'davinci', 'lut', 'preset', 'color grading', 'drone', 'macro',
  'portrait', 'street', 'wildlife', 'framing', 'gimbal', 'cinematography',
  'filmmaking', 'wedding', 'landscape', 'tripod', 'sensor', 'raw', 'jpeg', 'exif'
];

/**
 * AI Chatbot Pixie
 */
export const chatPixie = async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message content is required.' });
  }

  // 1. Guardrail Check: Check if message contains keywords related to photography
  const messageLower = message.toLowerCase();
  const isPhotographyRelated = PHOTOGRAPHY_KEYWORDS.some(kw => messageLower.includes(kw)) ||
    // Hinglish keywords
    ['khich', 'kheech', 'photo', 'camera', 'editing', 'shoot', 'video', 'lens'].some(kw => messageLower.includes(kw));

  if (!isPhotographyRelated) {
    return res.json({
      reply: "I'm designed specifically for photography, videography, filmmaking, and editing related topics. Please ask a photography related question."
    });
  }

  if (!genAI) {
    return res.json({
      reply: "Gemini API key is not configured. Please add GEMINI_API_KEY to your environment variables."
    });
  }

  try {
    // 2. Retrieval Augmented Generation (RAG): Search database for relevant documents
    const words = messageLower.split(/\s+/).filter(w => w.length > 3);
    let queryConditions = [];
    if (words.length > 0) {
      queryConditions = words.map(word => ({
        $or: [
          { title: { $regex: word, $options: 'i' } },
          { content: { $regex: word, $options: 'i' } }
        ]
      }));
    }

    let knowledgeContext = "";
    if (queryConditions.length > 0) {
      const matchedDocs = await ChatbotKnowledge.find({ $or: queryConditions }).limit(3);
      if (matchedDocs && matchedDocs.length > 0) {
        knowledgeContext = matchedDocs.map(doc => `Topic: ${doc.title}\nContent: ${doc.content}`).join('\n\n');
      }
    }

    // Default basic fallback knowledge context if DB is empty
    if (!knowledgeContext) {
      knowledgeContext = `
        Topic: Exposure Triangle
        Content: The exposure triangle consists of Aperture (controls depth of field and light entry), Shutter Speed (controls motion blur and duration of light), and ISO (controls sensor sensitivity and noise).
        
        Topic: Composition Rules
        Content: Key guidelines include the Rule of Thirds, Leading Lines, Framing, Symmetry, and Depth.
        
        Topic: Lens Choice
        Content: Prime lenses have fixed focal lengths and wider apertures (ideal for portraits, e.g., 50mm, 85mm). Zoom lenses offer focal flexibility (ideal for events, e.g., 24-70mm).
      `;
    }

    // 3. Generate response using Gemini-2.5-Flash
    const systemPrompt = `
      You are Pixie, the Pixela Photography Club AI Assistant.
      Personality: Professional, friendly, patient, knowledgeable.
      
      Instructions:
      1. Answer ONLY questions regarding Photography, Videography, Filmmaking, Editing, Cameras, and Lenses.
      2. If the user asks something unrelated, refuse politely in a friendly tone.
      3. Support English, Hindi, and Hinglish. Auto-detect the user's language and reply in the same tone and language.
      4. Use the provided context below to construct your answer. If the context does not contain relevant details to address the prompt, reply exactly: "I couldn't find reliable information for that photography topic." Do not guess or fabricate facts.
      
      RAG Context:
      ${knowledgeContext}
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent({
      contents: [
        { role: 'user', parts: [{ text: `${systemPrompt}\n\nUser Query: ${message}` }] }
      ]
    });

    const responseText = result.response.text().trim();
    return res.json({ reply: responseText });
  } catch (error) {
    console.error('Pixie Chat Error:', error);
    return res.status(500).json({ error: 'AI processing failed.' });
  }
};

/**
 * AI Photo Critique Vision Controller
 */
export const critiquePhoto = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Please upload a photo for critique.' });
  }

  if (!genAI) {
    return res.json({
      critique: {
        composition: "Gemini API key not configured.",
        lighting: "Please set GEMINI_API_KEY.",
        exposure: "f/2.8, 1/125s, ISO 100",
        suggestions: "Add API Key to unlock details.",
        caption: "A capturing gaze",
        hashtags: "#Pixela #Photography"
      }
    });
  }

  try {
    const imagePart = {
      inlineData: {
        data: req.file.buffer.toString("base64"),
        mimeType: req.file.mimetype
      },
    };

    const prompt = `
      Analyze this image from a photographer's perspective.
      Provide critique in clean JSON format matching this schema. Output ONLY the JSON block:
      {
        "composition": "detailed feedback on rule of thirds, leading lines, framing, balance",
        "lighting": "detailed feedback on highlights, shadows, directional light, quality of light",
        "exposure": "evaluation of exposure value, dynamic range, contrast",
        "color": "evaluation of color harmony, white balance, saturation",
        "sharpness": "evaluation of focus accuracy, depth of field, blur",
        "editingSuggestions": "Lightroom slider adjustments (e.g. Exposure +0.2, Contrast -10, Highlights -20, Shadows +15, Temp +200K)",
        "cameraSettings": "Recommended aperture, shutter speed, ISO to achieve/improve this style (e.g. f/1.8, 1/200s, ISO 100)",
        "lens": "Recommended lens focal length (e.g. 85mm f/1.4 prime, 24-70mm f/2.8 zoom)",
        "preset": "Editing preset theme (e.g. Cinematic Warm, Teal & Orange, Moody Matte)",
        "caption": "A catchy, artistic story-driven caption for the image",
        "hashtags": "Space-separated relevant photography hashtags (e.g. #portraitphotography #sonyalpha #depthoffield)"
      }
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent([prompt, imagePart]);
    const responseText = result.response.text();
    
    // Clean response to parse JSON
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Invalid model JSON output: " + responseText);
    }
    const critiqueData = JSON.parse(jsonMatch[0]);

    return res.json({ critique: critiqueData });
  } catch (error) {
    console.error('Critique Photo Error:', error);
    return res.status(500).json({ error: 'AI vision processing failed.' });
  }
};
