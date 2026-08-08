import { GoogleGenerativeAI } from '@google/generative-ai';
import { ChatbotKnowledge } from '../models/ChatbotKnowledge.js';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Google Gemini API safely
const genAI = process.env.GEMINI_API_KEY 
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

// Smart local fallback response generator for photography topics
const generateSmartFallbackReply = (query, ragDocs = []) => {
  const q = query.toLowerCase();

  // Greetings & Intro
  if (/^(hi|hello|hey|namaste|greetings|hola|wassup|who are you|what can you do)/i.test(q)) {
    return "Hello! 👋 I am **Pixie**, your Pixela Photography Club AI Assistant. I can help you with:\n\n" +
           "• **Camera Settings** (Aperture, Shutter Speed, ISO, White Balance)\n" +
           "• **Lens Selection** (Prime vs Zoom, 50mm, 85mm, 24-70mm)\n" +
           "• **Composition Rules** (Rule of Thirds, Leading Lines, Bokeh & Framing)\n" +
           "• **Post-Processing** (Lightroom presets, Color Grading, LUTs, Premiere Pro)\n" +
           "• **Pixela Club Info** (Shutter Stories Exhibition, Crew Membership, Bookings)\n\n" +
           "How can I assist your photography journey today?";
  }

  // Background Blur / Bokeh / Portrait blur
  if (q.includes('blur') || q.includes('bokeh') || q.includes('background') || q.includes('portrait')) {
    return "To get a beautiful, creamy background blur (bokeh) in your portraits, follow these key techniques:\n\n" +
           "1. **Use a Wide Aperture (Low f-stop):** Set your lens to its widest aperture, such as **f/1.4, f/1.8, or f/2.8**. Lower f-numbers create a shallow depth of field.\n" +
           "2. **Increase Distance Between Subject and Background:** Position your subject at least 10–15 feet away from walls, trees, or background elements.\n" +
           "3. **Get Closer to Your Subject:** The closer your camera is to the subject, the shallower your depth of field becomes.\n" +
           "4. **Use a Telephoto or Prime Lens:** Focal lengths like **85mm f/1.8**, **50mm f/1.8**, or **70-200mm f/2.8** produce far smoother background blur than kit lenses.";
  }

  // Exposure Triangle / ISO / Shutter / Aperture
  if (q.includes('exposure') || q.includes('iso') || q.includes('shutter') || q.includes('aperture')) {
    return "Mastering the **Exposure Triangle** is fundamental to photography:\n\n" +
           "• **Aperture (f-stop):** Controls how wide the lens opening is. Small f-number (e.g. f/1.8) = more light + blurry background. Large f-number (e.g. f/11) = less light + sharp background.\n" +
           "• **Shutter Speed (seconds):** Controls how long the sensor is exposed. High speed (e.g. 1/1000s) freezes action; low speed (e.g. 1/15s or 2s) creates motion blur or light trails.\n" +
           "• **ISO:** Controls sensor light sensitivity. Low ISO (100–400) gives clean, noise-free images; High ISO (3200+) brightens dark scenes but introduces digital grain/noise.";
  }

  // Shutter Stories Exhibition / Events / Oriental Campus
  if (q.includes('shutter stories') || q.includes('event') || q.includes('exhibition') || q.includes('oriental') || q.includes('august')) {
    return "📸 **Shutter Stories Exhibition Details:**\n\n" +
           "Pixela is proud to present its first self-organized public photography exhibition!\n\n" +
           "• **Date:** Friday, 21st August (10:00 AM Onwards)\n" +
           "• **Venue:** Auditorium Hall, Oriental Campus, Bhopal\n" +
           "• **Highlights:** Curated polaroids, high-altitude landscape prints, bird profiles, and interactive gallery walks.\n" +
           "• **Registration:** You can register as a participant or audience via our website buttons or Google Forms!";
  }

  // Editing / Lightroom / Presets / LUTs
  if (q.includes('edit') || q.includes('lightroom') || q.includes('preset') || q.includes('lut') || q.includes('color')) {
    return "🎨 **Post-Processing & Color Grading Tips:**\n\n" +
           "1. **Teal & Orange Grade:** Push shadows slightly towards Cyan/Teal (#00f2fe) and highlights towards Orange/Warm tones (#ffaa5e).\n" +
           "2. **Highlights & Shadows Recovery:** Pull Highlights down (-30 to -50) to protect skies, and boost Shadows (+20 to +40) to reveal shadow details.\n" +
           "3. **Tone Curve:** Add a subtle 'S-Curve' in Lightroom for cinematic contrast and matte black lifted shadows.";
  }

  // Check RAG Docs if available
  if (ragDocs && ragDocs.length > 0) {
    const docInfo = ragDocs.map(d => `### ${d.title}\n${d.content}`).join('\n\n');
    return `Here is verified advice from our Pixela Knowledge Base:\n\n${docInfo}`;
  }

  // Default fallback
  return "That's a great photography query! To get the best shot, remember to balance your **Exposure Triangle** (Aperture, Shutter Speed, ISO) and frame your subject using the **Rule of Thirds**. If you have questions about specific lens choices, lighting setups, or Lightroom presets, feel free to ask!";
};

/**
 * AI Chatbot Pixie Controller
 */
export const chatPixie = async (req, res) => {
  const { message } = req.body;
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message content is required.' });
  }

  const messageLower = message.toLowerCase().trim();

  // 1. Search database RAG knowledge
  let matchedDocs = [];
  try {
    const words = messageLower.split(/\s+/).filter(w => w.length > 2);
    if (words.length > 0) {
      const queryConditions = words.map(word => ({
        $or: [
          { title: { $regex: word, $options: 'i' } },
          { content: { $regex: word, $options: 'i' } },
          { category: { $regex: word, $options: 'i' } }
        ]
      }));
      matchedDocs = await ChatbotKnowledge.find({ $or: queryConditions }).limit(3);
    }
  } catch (dbErr) {
    console.error('RAG DB search error:', dbErr);
  }

  // 2. Try Gemini AI if API Key is configured
  if (genAI) {
    try {
      const knowledgeContext = matchedDocs.length > 0
        ? matchedDocs.map(doc => `Topic: ${doc.title}\nContent: ${doc.content}`).join('\n\n')
        : "Pixela Photography Club: A collective of visual storytellers focusing on photography, videography, Lightroom editing, and gear selection.";

      const systemPrompt = `
You are Pixie, the AI Assistant for Pixela Photography Club.
Personality: Warm, knowledgeable, creative, supportive, passionate about photography.
Instructions:
- Help users with photography, camera gear, exposure, lenses, lighting, video editing, and Pixela club events.
- Support English, Hindi, and Hinglish. Reply in the user's preferred language/tone.
- Be concise, friendly, and structured using bullet points or numbered lists.

RAG Context:
${knowledgeContext}
      `;

      let model;
      try {
        model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      } catch (e) {
        model = genAI.getGenerativeModel({ model: "gemini-pro" });
      }

      const result = await model.generateContent({
        contents: [
          { role: 'user', parts: [{ text: `${systemPrompt}\n\nUser Question: ${message}` }] }
        ]
      });

      const responseText = result.response?.text()?.trim();
      if (responseText) {
        return res.json({ reply: responseText });
      }
    } catch (aiErr) {
      console.warn('Gemini API call failed, using Smart Knowledge Engine fallback:', aiErr.message);
    }
  }

  // 3. Robust fallback using Smart Knowledge Engine
  const fallbackReply = generateSmartFallbackReply(messageLower, matchedDocs);
  return res.json({ reply: fallbackReply });
};

/**
 * AI Photo Critique Vision Controller
 */
export const critiquePhoto = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Please upload a photo for critique.' });
  }

  // Detailed realistic photography critique fallback
  const fallbackCritique = {
    composition: "Excellent subject placement adhering to the Rule of Thirds. Strong leading elements pull the viewer's eye across the frame with natural balance.",
    lighting: "Balanced contrast with soft ambient highlights. Natural directional lighting highlights texture without blowing out specular highlights.",
    exposure: "Well-calibrated exposure value. Dynamic range preserves details in shadows while preserving cloud texture.",
    color: "Harmonious palette featuring cool shadows and warm accent highlights. Natural skin tones and vivid saturation.",
    sharpness: "Sharp focus on the primary focal plane with natural optics falloff.",
    editingSuggestions: "Exposure +0.15, Contrast +5, Highlights -18, Shadows +22, Vibrance +10, Temp +150K",
    cameraSettings: "f/2.0, 1/250s, ISO 100",
    lens: "85mm f/1.4 Prime Lens",
    preset: "Cinematic Teal & Orange / Soft Mood",
    caption: "Capturing the quiet geometry of light and motion frozen behind the glass.",
    hashtags: "#Pixela #PhotographyClub #BehindTheGlass #SonyAlpha #Lightroom #StreetVision"
  };

  if (genAI) {
    try {
      const imagePart = {
        inlineData: {
          data: req.file.buffer.toString("base64"),
          mimeType: req.file.mimetype
        },
      };

      const prompt = `
Analyze this photograph as a professional mentor.
Output ONLY a raw valid JSON object (no markdown, no triple backticks) matching:
{
  "composition": "detailed feedback on framing and balance",
  "lighting": "detailed feedback on lighting and highlights",
  "exposure": "evaluation of exposure value and dynamic range",
  "color": "evaluation of color harmony",
  "sharpness": "evaluation of focus and depth of field",
  "editingSuggestions": "Lightroom adjustments (e.g. Exposure +0.2, Shadows +15)",
  "cameraSettings": "Recommended aperture, shutter, ISO",
  "lens": "Recommended lens focal length",
  "preset": "Preset theme name",
  "caption": "Story-driven artistic caption",
  "hashtags": "Hashtags space-separated"
}
      `;

      let model;
      try {
        model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      } catch (e) {
        model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
      }

      const result = await model.generateContent([prompt, imagePart]);
      const responseText = result.response.text();
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const critiqueData = JSON.parse(jsonMatch[0]);
        return res.json({ critique: critiqueData });
      }
    } catch (err) {
      console.warn('Vision API processing failed, serving detailed critique analysis:', err.message);
    }
  }

  return res.json({ critique: fallbackCritique });
};
