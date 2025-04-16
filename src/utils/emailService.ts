
import { Project } from "@/types/project";
import { toast } from "@/components/ui/use-toast";

// SMTP configuration (in a real app, these would be environment variables)
const SMTP_CONFIG = {
  enabled: true, // Toggle this for testing without sending actual emails
  host: "smtp.example.com",
  port: 587,
  secure: false,
  auth: {
    user: "notifications@cogswellshare.com",
    pass: "your_smtp_password"
  },
  fromEmail: "notifications@cogswellshare.com",
  fromName: "CogswellShare"
};

// This function would retrieve the SMTP config from localStorage in a real app
export const getSmtpConfig = () => {
  // In a real implementation, this would get the SMTP config from localStorage or an API
  // For simplicity, we'll just return the default config
  return SMTP_CONFIG;
};

// This function would save the SMTP config to localStorage in a real app
export const saveSmtpConfig = (config: typeof SMTP_CONFIG) => {
  // In a real implementation, this would save the SMTP config to localStorage or an API
  // For simplicity, we'll just log it
  console.log("Saving SMTP config:", config);
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
