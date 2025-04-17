
// SMTP configuration type
export type SMTPConfig = {
  enabled: boolean;
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  fromEmail: string;
  fromName: string;
};

// Default SMTP configuration
const DEFAULT_SMTP_CONFIG: SMTPConfig = {
  enabled: true,
  host: "w01ead7a.kasserver.com",
  port: 587,
  secure: false,
  auth: {
    user: "share@cogswell.it",
    pass: "Cogswell2024#+"
  },
  fromEmail: "share@cogswell.it",
  fromName: "CogswellShare"
};

// LocalStorage key for SMTP config
const SMTP_CONFIG_KEY = 'cogswellshare_smtp_config';

// This function retrieves the SMTP config from localStorage
export const getSmtpConfig = (): SMTPConfig => {
  try {
    const storedConfig = localStorage.getItem(SMTP_CONFIG_KEY);
    if (storedConfig) {
      return JSON.parse(storedConfig) as SMTPConfig;
    }
  } catch (error) {
    console.error("Error retrieving SMTP config:", error);
  }
  return DEFAULT_SMTP_CONFIG;
};

// This function saves the SMTP config to localStorage
export const saveSmtpConfig = (config: SMTPConfig): boolean => {
  try {
    localStorage.setItem(SMTP_CONFIG_KEY, JSON.stringify(config));
    console.log("SMTP config saved:", config);
    return true;
  } catch (error) {
    console.error("Error saving SMTP config:", error);
    return false;
  }
};
