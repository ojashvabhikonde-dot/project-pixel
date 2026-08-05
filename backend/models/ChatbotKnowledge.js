import mongoose from 'mongoose';

const chatbotKnowledgeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true }, // The structural snippet text containing factual photography details
    category: { type: String, default: 'General Photography' },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

export const ChatbotKnowledge = mongoose.model('ChatbotKnowledge', chatbotKnowledgeSchema);
