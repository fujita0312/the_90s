/**
 * Utility functions for room management (Frontend)
 */

/**
 * Generate a unique room ID for two users
 * The room ID is always the same regardless of the order of usernames
 * @param username1 First username
 * @param username2 Second username
 * @returns Unique room ID
 */
export function generateRoomId(username1: string, username2: string): string {
  // Sort usernames to ensure consistent room ID regardless of order
  const sortedUsernames = [username1, username2].sort();
  return `room_${sortedUsernames[0]}_${sortedUsernames[1]}`;
}

/**
 * Extract usernames from a room ID
 * @param roomId The room ID
 * @returns Array of usernames in the room
 */
export function getUsernamesFromRoomId(roomId: string): string[] {
  const parts = roomId.split('_');
  if (parts.length === 3 && parts[0] === 'room') {
    return [parts[1], parts[2]];
  }
  return [];
}

/**
 * Check if a user is part of a room
 * @param roomId The room ID
 * @param username The username to check
 * @returns True if user is part of the room
 */
export function isUserInRoom(roomId: string, username: string): boolean {
  const usernames = getUsernamesFromRoomId(roomId);
  return usernames.includes(username);
}
