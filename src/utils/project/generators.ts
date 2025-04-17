
// Generate a new project ID
export const generateProjectId = (): string => {
  return `proj-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
};

// Generate a magic key for a project
export const generateMagicKey = (): string => {
  return `key-${Math.random().toString(36).substring(2, 12)}`;
};
