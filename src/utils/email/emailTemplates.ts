
import { Project } from "@/types/project";

// Email templates in both English and German
export const EMAIL_TEMPLATES = {
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
