/**
 * Utility functions for admin mode functionality
 */

/**
 * Check if admin mode is enabled based on URL parameters
 * @returns boolean indicating if admin mode is active
 */
export const isAdminMode = (): boolean => {
  const urlParams = new URLSearchParams(window.location.search);
  // console.log('=================>',urlParams.get('admin'),urlParams);
  return urlParams.get('admin') === 'true';
};

/**
 * Get admin parameter value from URL
 * @returns string value of admin parameter or null if not present
 */
export const getAdminParam = (): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('admin');
};
