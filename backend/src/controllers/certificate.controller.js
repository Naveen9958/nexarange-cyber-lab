import { certificateService } from '../services/certificate.service.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const getAll = async (req, res, next) => {
  try {
    const certificates = await certificateService.getUserCertificates(req.user._id);
    return sendSuccess(res, { certificates });
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const certificate = await certificateService.getCertificateById(req.user._id, id);
    if (!certificate) {
      return sendError(res, 'Certificate not found or not owned by user', 'NOT_FOUND', 404);
    }
    return sendSuccess(res, { certificate });
  } catch (error) {
    next(error);
  }
};
