import { SessionService } from "./session-service";
import { UserRepository } from "./user-repository";

// main logic lives here.
export const sessionService = new SessionService();
export const userRepository = new UserRepository();

// provide backwards compatible exports for previous implementations in my app
export const verifySession = sessionService.verifySession;
export const checkUserPermission = sessionService.checkUserPermission;
export const getUser = async () => {
  const session = await sessionService.verifySession();
  return userRepository.getUser(session);
};
export const getUserPosts = async () => {
  const session = await sessionService.verifySession();
  return userRepository.getUserPosts(session);
};
