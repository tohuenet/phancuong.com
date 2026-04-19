import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface CommentNotification {
  postTitle: string;
  postUrl: string;
  commentAuthor: string;
  commentContent: string;
}

export async function sendCommentNotification({ 
  postTitle, 
  postUrl, 
  commentAuthor, 
  commentContent 
}: CommentNotification) {
  const adminEmail = process.env.ALLOWED_EMAIL;
  if (!adminEmail) return;

  const mailOptions = {
    from: `"phancuong.com" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to: adminEmail,
    subject: `🔔 Bình luận mới: ${postTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; borderRadius: 10px;">
        <h2 style="color: #3b82f6;">Có bình luận mới trên blog của bạn</h2>
        <p><strong>Bài viết:</strong> ${postTitle}</p>
        <p><strong>Người bình luận:</strong> ${commentAuthor}</p>
        <p><strong>Nội dung:</strong></p>
        <div style="background: #f9fafb; padding: 15px; border-radius: 5px; border-left: 4px solid #3b82f6;">
          ${commentContent}
        </div>
        <p style="margin-top: 20px;">
          <a href="${postUrl}" style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Xem bình luận</a>
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Comment notification email sent.');
  } catch (error) {
    console.error('Failed to send comment notification email:', error);
  }
}
