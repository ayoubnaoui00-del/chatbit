import MessageModel from '../models/message.model.js';
import ConversationModel from '../models/conversation.model.js';

export const getMessages = async (req, res, next) => {
  try {
    const conversationId = parseInt(req.params.id, 10);
    const { id: userId, role } = req.user;

    if (isNaN(conversationId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid conversation ID',
      });
    }

    const conversation = await ConversationModel.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found',
      });
    }

    if (role === 'client' && conversation.clientid !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You do not have access to this conversation',
      });
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 20));
    const offset = (page - 1) * limit;

    const totalMessages = await MessageModel.countByConversationId(conversationId);
    const totalPages = Math.ceil(totalMessages / limit) || 1;
    const messages = await MessageModel.findByConversationId(conversationId, limit, offset);

    return res.status(200).json({
      success: true,
      data: {
        page,
        limit,
        totalMessages,
        totalPages,
        messages,
      },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getMessages,
};
