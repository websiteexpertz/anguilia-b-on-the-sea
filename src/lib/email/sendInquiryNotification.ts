import { Resend } from "resend";
import type { CustomerInquiry } from "@/lib/types/inquiry";
import { getSiteSettings } from "@/lib/db/services/adminProfileService";

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}

export async function sendInquiryNotification(inquiry: CustomerInquiry): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

  if (!apiKey) {
    console.warn("Inquiry email notification skipped: configure RESEND_API_KEY.");
    return;
  }

  try {
    const settings = await getSiteSettings();
    const recipient =
      settings.notificationEmail ||
      process.env.RESEND_NOTIFICATION_EMAIL ||
      settings.contactEmail;
    if (!settings.notifications.emailOnInquiry || !recipient) return;

    const safe = {
      name: escapeHtml(inquiry.name),
      email: escapeHtml(inquiry.email),
      phone: escapeHtml(inquiry.phone || "Not provided"),
      dates: escapeHtml(
        inquiry.checkIn && inquiry.checkOut
          ? `${inquiry.checkIn} to ${inquiry.checkOut}`
          : "Dates not selected"
      ),
      guests: escapeHtml(inquiry.guests ? String(inquiry.guests) : "Not provided"),
      subject: escapeHtml(inquiry.subject),
      message: escapeHtml(inquiry.message).replace(/\n/g, "<br>") || "No message provided.",
    };

    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to: recipient,
      replyTo: inquiry.email,
      subject: `New villa inquiry from ${inquiry.name}`,
      html: `
        <h2>New Villa B on the Sea inquiry</h2>
        <p><strong>Name:</strong> ${safe.name}</p>
        <p><strong>Email:</strong> ${safe.email}</p>
        <p><strong>Phone:</strong> ${safe.phone}</p>
        <p><strong>Dates:</strong> ${safe.dates}</p>
        <p><strong>Guests:</strong> ${safe.guests}</p>
        <p><strong>Subject:</strong> ${safe.subject}</p>
        <p><strong>Message:</strong><br>${safe.message}</p>
        <p>View and manage this inquiry in the admin panel.</p>
      `,
    });

    if (error) {
      console.error("Resend inquiry notification failed:", error.message);
    }
  } catch (error) {
    console.error("Resend inquiry notification failed:", error);
  }
}