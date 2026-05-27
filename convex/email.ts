"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { Resend } from "resend";

export const sendWorkspaceInviteEmail = action({
  args: {
    to: v.string(),
    workspaceName: v.string(),
    inviteToken: v.string(),
    inviterName: v.optional(v.string()),
    channelName: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ??
      process.env.SITE_URL ??
      "http://localhost:3000";

    const inviteUrl = `${appUrl}/join/invite/${args.inviteToken}`;
    const resend = new Resend(apiKey);
    const from =
      process.env.RESEND_FROM_EMAIL ?? "Slack Clone <onboarding@resend.dev>";

    const inviter = args.inviterName ? `${args.inviterName} invited you` : "You've been invited";
    const channelLine = args.channelName
      ? ` to join the #${args.channelName} channel`
      : "";

    await resend.emails.send({
      from,
      to: args.to,
      subject: `Join ${args.workspaceName} on Slack Clone`,
      html: `
        <p>${inviter}${channelLine} in <strong>${args.workspaceName}</strong>.</p>
        <p><a href="${inviteUrl}">Accept invitation</a></p>
        <p>Or copy this link: ${inviteUrl}</p>
      `,
    });
  },
});
