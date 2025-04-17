import { Project } from "@/types/project";
import { toast } from "@/components/ui/use-toast";

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

// Email templates in both English and German
const EMAIL_TEMPLATES = {
  // Project creation notification
  newProject: {
    en: {
      subject: "New project ready for your review",
      body: (project: Project, link: string) => `
        <h2>Hello,</h2>
        <p>A new project "${project.name}" has been created for your review.</p>
        <p>You can access it using the magic link below:</p>
        <p><a href="${link}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">View Project</a></p>
        <p>This link will ${project.expiresAt ? `expire on ${new Date(project.expiresAt).toLocaleDateString()}.` : 'not expire.'}</p>
        <p>Best regards,<br>The CogswellShare Team</p>
      `
    },
    de: {
      subject: "Neues Projekt zur Überprüfung bereit",
      body: (project: Project, link: string) => `
        <h2>Hallo,</h2>
        <p>Ein neues Projekt "${project.name}" wurde für Ihre Überprüfung erstellt.</p>
        <p>Sie können darauf über den folgenden Magic-Link zugreifen:</p>
        <p><a href="${link}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Projekt ansehen</a></p>
        <p>Dieser Link wird ${project.expiresAt ? `am ${new Date(project.expiresAt).toLocaleDateString()} ablaufen.` : 'nicht ablaufen.'}</p>
        <p>Mit freundlichen Grüßen,<br>Das CogswellShare Team</p>
      `
    }
  },
  
  // Reminder email
  reminder: {
    en: {
      subject: "Reminder: Project awaiting your review",
      body: (project: Project, link: string) => `
        <h2>Hello,</h2>
        <p>This is a friendly reminder that project "${project.name}" is still awaiting your review.</p>
        <p>You can access it using the magic link below:</p>
        <p><a href="${link}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">View Project</a></p>
        <p>Your feedback is important to us.</p>
        <p>Best regards,<br>The CogswellShare Team</p>
      `
    },
    de: {
      subject: "Erinnerung: Projekt wartet auf Ihre Überprüfung",
      body: (project: Project, link: string) => `
        <h2>Hallo,</h2>
        <p>Dies ist eine freundliche Erinnerung, dass das Projekt "${project.name}" noch auf Ihre Überprüfung wartet.</p>
        <p>Sie können darauf über den folgenden Magic-Link zugreifen:</p>
        <p><a href="${link}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Projekt ansehen</a></p>
        <p>Ihr Feedback ist uns wichtig.</p>
        <p>Mit freundlichen Grüßen,<br>Das CogswellShare Team</p>
      `
    }
  }
};

// Send email function (simulated in this frontend-only implementation)
export const sendEmail = async (
  to: string,
  subject: string,
  htmlBody: string
): Promise<boolean> => {
  const config = getSmtpConfig();
  
  if (!config.enabled) {
    console.log("Email sending disabled. Would have sent:", { to, subject });
    return true;
  }
  
  try {
    // In a real implementation, this would connect to an API endpoint
    // that handles the actual SMTP sending
    console.log("Sending email to:", to);
    console.log("Subject:", subject);
    console.log("Body:", htmlBody);
    console.log("Using SMTP config:", config);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Simulate success (in a real app, this would be the response from the API)
    return true;
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
};

// Send project creation notification
export const sendProjectNotification = async (
  project: Project,
  language: 'en' | 'de' = 'en'
): Promise<boolean> => {
  try {
    const baseUrl = window.location.origin;
    const projectLink = `${baseUrl}/portal?id=${project.id}&key=${project.magicKey}`;
    
    const template = EMAIL_TEMPLATES.newProject[language];
    const result = await sendEmail(
      project.customerEmail,
      template.subject,
      template.body(project, projectLink)
    );
    
    if (result) {
      toast({
        title: language === 'en' ? "Email sent successfully" : "E-Mail erfolgreich gesendet",
        description: language === 'en' 
          ? `Notification sent to ${project.customerEmail}` 
          : `Benachrichtigung an ${project.customerEmail} gesendet`,
      });
    } else {
      toast({
        title: language === 'en' ? "Failed to send email" : "E-Mail konnte nicht gesendet werden",
        description: language === 'en'
          ? "There was an error sending the notification"
          : "Beim Senden der Benachrichtigung ist ein Fehler aufgetreten",
        variant: "destructive",
      });
    }
    
    return result;
  } catch (error) {
    console.error("Error sending project notification:", error);
    return false;
  }
};

// Send reminder email
export const sendReminderEmail = async (
  project: Project,
  language: 'en' | 'de' = 'en'
): Promise<boolean> => {
  try {
    const baseUrl = window.location.origin;
    const projectLink = `${baseUrl}/portal?id=${project.id}&key=${project.magicKey}`;
    
    const template = EMAIL_TEMPLATES.reminder[language];
    const result = await sendEmail(
      project.customerEmail,
      template.subject,
      template.body(project, projectLink)
    );
    
    if (result) {
      toast({
        title: language === 'en' ? "Reminder sent" : "Erinnerung gesendet",
        description: language === 'en'
          ? `Reminder email sent to ${project.customerEmail}`
          : `Erinnerungs-E-Mail an ${project.customerEmail} gesendet`,
      });
    } else {
      toast({
        title: language === 'en' ? "Failed to send reminder" : "Erinnerung konnte nicht gesendet werden",
        description: language === 'en'
          ? "There was an error sending the reminder"
          : "Beim Senden der Erinnerung ist ein Fehler aufgetreten",
        variant: "destructive",
      });
    }
    
    return result;
  } catch (error) {
    console.error("Error sending reminder:", error);
    return false;
  }
};
