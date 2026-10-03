import { Notification } from '../models/Notification.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const getAll = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30);

    return sendSuccess(res, { notifications });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return sendError(res, 'Notification not found or unauthorized', 'NOT_FOUND', 404);
    }

    return sendSuccess(res, { notification });
  } catch (error) {
    next(error);
  }
};
