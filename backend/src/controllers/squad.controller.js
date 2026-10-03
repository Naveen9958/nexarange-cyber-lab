import { sendSuccess } from '../utils/apiResponse.js';

// Base squad peer profiles matching frontend data
const INITIAL_FRIENDS = [
  { name: 'Devika Rao', xp: 3750, status: 'Active in Operations', online: true, avatar: 'D', track: 'AI Security' },
  { name: 'Yusuf Ansari', xp: 2900, status: 'Auditing Connectors', online: true, avatar: 'Y', track: 'AppSec & APIs' },
  { name: 'Simran Kaur', xp: 3100, status: 'Analyzing Prompt Injections', online: true, avatar: 'S', track: 'AI Red Team' },
  { name: 'Astra_Sec', xp: 4180, status: 'Offline', online: false, avatar: 'A', track: 'Cloud Forensics' },
  { name: 'cipher_null', xp: 4420, status: 'Offline', online: false, avatar: 'C', track: 'Zero Trust' },
];

const INITIAL_REQUESTS = [
  { name: 'K8s_Defender', xp: 1850, track: 'Kubernetes Defense', avatar: 'K' },
  { name: 'ZeroDay_Hunter', xp: 2400, track: 'Vulnerability Analysis', avatar: 'Z' },
];

export const getSquad = async (req, res, next) => {
  try {
    return sendSuccess(res, {
      friends: INITIAL_FRIENDS,
      friendRequests: INITIAL_REQUESTS,
    });
  } catch (error) {
    next(error);
  }
};
