import mongoose from 'mongoose';

// Rolling conversation history per user, used to give the RAG chatbot
// short-term memory across turns. Each user has effectively one running
// session (kept simple deliberately -- no multi-thread chat history UI).
const ChatMessageSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    // The retrieved event ids used as grounding context for this turn, kept
    // for debugging/traceability of the RAG pipeline.
    sourceEventIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
  },
  { timestamps: true }
);

ChatMessageSchema.index({ user: 1, createdAt: 1 });

const ChatMessage = mongoose.model('ChatMessage', ChatMessageSchema);

export default ChatMessage;
