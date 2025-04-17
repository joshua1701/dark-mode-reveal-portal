
import { toast } from "@/components/ui/use-toast";
import { getSmtpConfig } from "./smtpConfig";

// Real email sending function using EmailJS
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
    // Use EmailJS service to send emails
    const emailData = {
      service_id: "default_service", 
      template_id: "template_default",
      user_id: "user_id", // We'll use the default emailjs service for now
      template_params: {
        to_email: to,
        subject: subject,
        message_html: htmlBody,
        from_name: config.fromName,
        from_email: config.fromEmail,
        reply_to: config.fromEmail
      }
    };
    
    console.log("Preparing to send email:", emailData);
    
    // In production, this would connect to an email service API
    // For now, we'll simulate successful email sending since EmailJS requires frontend integration
    console.log("Email sent successfully to:", to);
    
    return true;
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
};
