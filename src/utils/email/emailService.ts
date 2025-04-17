
import { Project } from "@/types/project";
import { toast } from "@/components/ui/use-toast";
import { sendEmail } from "./emailSender";
import { EMAIL_TEMPLATES } from "./emailTemplates";

// Export SMTP-related types and functions from the smtpConfig file
export { 
  SMTPConfig, 
  getSmtpConfig, 
  saveSmtpConfig 
} from "./smtpConfig";

// Send project creation notification
export const sendProjectNotification = async (
  project: Project,
  language: 'en' | 'de' = 'en'
): Promise<boolean> => {
  try {
    const baseUrl = window.location.origin;
    const projectLink = `${baseUrl}/portal?id=${project.id}&key=${project.magicKey}`;
    
    const template = EMAIL_TEMPLATES.newProject[language];
    
    try {
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
      console.error("Error in sendEmail function:", error);
      toast({
        title: "Email Service Error",
        description: "Project created successfully, but notification email could not be sent.",
        variant: "destructive",
      });
      return false;
    }
  } catch (error) {
    console.error("Error sending project notification:", error);
    toast({
      title: "Email Service Error",
      description: "Project created successfully, but notification email could not be sent.",
      variant: "destructive",
    });
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
    
    try {
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
      console.error("Error in sendEmail function:", error);
      toast({
        title: "Email Service Error",
        description: "Reminder function triggered, but email could not be sent.",
        variant: "destructive",
      });
      return false;
    }
  } catch (error) {
    console.error("Error sending reminder:", error);
    toast({
      title: "Email Service Error",
      description: "Reminder function triggered, but email could not be sent.",
      variant: "destructive",
    });
    return false;
  }
};
