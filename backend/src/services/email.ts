import nodemailer from "nodemailer";

// Create transporter (only if SMTP is configured)
function createTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: { user, pass },
  });
}

const FROM = process.env.SMTP_FROM || "noreply@africacoffeeexpo.com";
const APP_NAME = "Africa Coffee & Tea Expo 2026";

export async function sendTaskAssignedEmail(task: {
  title: string;
  description: string;
  assignedTo: string;
  assignedToName: string;
  createdBy: string;
  dueDate: string;
  priority: string;
  category: string;
}): Promise<void> {
  const transporter = createTransporter();

  if (!transporter) {
    console.log(`[Email] SMTP not configured. Would send task assigned email to ${task.assignedTo}`);
    console.log(`[Email] Task: ${task.title}`);
    return;
  }

  const priorityEmoji: Record<string, string> = {
    low: "🟢",
    medium: "🟡",
    high: "🟠",
    urgent: "🔴",
  };
  const emoji = priorityEmoji[task.priority] ?? "⚪";

  await transporter.sendMail({
    from: `"${APP_NAME}" <${FROM}>`,
    to: task.assignedTo,
    subject: `${emoji} Task Assigned: ${task.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #4A3728; padding: 20px; text-align: center;">
          <h1 style="color: #FAF7F2; margin: 0; font-size: 20px;">${APP_NAME}</h1>
          <p style="color: #8DB53C; margin: 5px 0;">Task Management</p>
        </div>
        <div style="padding: 30px; background: #fff;">
          <h2 style="color: #4A3728;">Hello ${task.assignedToName},</h2>
          <p>A new task has been assigned to you:</p>
          <div style="background: #FAF7F2; border-left: 4px solid #8DB53C; padding: 15px; margin: 20px 0;">
            <h3 style="color: #4A3728; margin: 0 0 10px;">${task.title}</h3>
            <p style="color: #5A5A5A; margin: 0 0 10px;">${task.description}</p>
            <p style="margin: 5px 0;"><strong>Category:</strong> ${task.category}</p>
            <p style="margin: 5px 0;"><strong>Priority:</strong> ${emoji} ${task.priority.toUpperCase()}</p>
            <p style="margin: 5px 0;"><strong>Due Date:</strong> ${new Date(task.dueDate).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
            <p style="margin: 5px 0;"><strong>Assigned by:</strong> ${task.createdBy}</p>
          </div>
        </div>
        <div style="background: #4A3728; padding: 15px; text-align: center;">
          <p style="color: #FAF7F2; margin: 0; font-size: 12px;">Africa Coffee &amp; Tea Expo 2026 | Task Management System</p>
        </div>
      </div>
    `,
  });
}

export async function sendTaskStatusEmail(task: {
  title: string;
  assignedTo: string;
  assignedToName: string;
  status: string;
  updatedBy: string;
}): Promise<void> {
  const transporter = createTransporter();

  if (!transporter) {
    console.log(`[Email] SMTP not configured. Would send status update email to ${task.assignedTo}`);
    return;
  }

  const statusLabel: Record<string, string> = {
    "pending": "Pending",
    "in-progress": "In Progress",
    "completed": "Completed",
    "overdue": "Overdue",
  };
  const label = statusLabel[task.status] ?? task.status;

  await transporter.sendMail({
    from: `"${APP_NAME}" <${FROM}>`,
    to: task.assignedTo,
    subject: `Task Update: ${task.title} -> ${label}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #4A3728; padding: 20px; text-align: center;">
          <h1 style="color: #FAF7F2; margin: 0; font-size: 20px;">${APP_NAME}</h1>
        </div>
        <div style="padding: 30px; background: #fff;">
          <h2 style="color: #4A3728;">Task Status Updated</h2>
          <p>The status of <strong>${task.title}</strong> has been updated to <strong>${label}</strong> by ${task.updatedBy}.</p>
        </div>
        <div style="background: #4A3728; padding: 15px; text-align: center;">
          <p style="color: #FAF7F2; margin: 0; font-size: 12px;">Africa Coffee &amp; Tea Expo 2026 | Task Management System</p>
        </div>
      </div>
    `,
  });
}
