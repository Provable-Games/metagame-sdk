// Environment utility to work with both Node.js and Vite environments

export const isDevelopment = (): boolean => {
  // Check for Vite environment
  // @ts-ignore - import.meta might not exist in all environments
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    // @ts-ignore
    return import.meta.env.DEV === true;
  }

  // Default to false if neither environment is detected
  return false;
};
