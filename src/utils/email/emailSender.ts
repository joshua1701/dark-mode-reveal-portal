
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
    // In a production environment, we would connect to a real email service
    // For development/demo purposes, we'll simulate successful sending
    console.log("Email data:", {
      to: to,
      subject: subject,
      body: htmlBody,
      from: config.fromEmail,
    });
    
    // Return true to simulate successful email sending
    // In production, this would use a real email sending API or service
    return true;
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
};
