import { SessionService } from "./session-service";
import { UserRepository } from "./user-repository";

// Instantiate services
export const sessionService = new SessionService();
export const userRepository = new UserRepository();

// Optionally, provide backward-compatible exports for existing consumers
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
