import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

export interface SendAccountEmailOptions {
  to: string;
  fullName: string;
  username: string;
  passwordRaw: string;
  companyName?: string;
  memberCode?: string;
  portalUrl?: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initTransporter();
  }

  private initTransporter() {
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = Number(process.env.SMTP_PORT) || 465;
    const user = process.env.SMTP_USER || process.env.GMAIL_USER || '';
    const pass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || '';

    if (user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
      this.logger.log(`SMTP Mailer initialized with user: ${user}`);
    } else {
      this.logger.warn(
        'SMTP credentials not fully configured (SMTP_USER/SMTP_PASS). Email sending will operate in mock/audit log mode.',
      );
    }
  }

  /**
   * Gửi email thông tin tài khoản đăng nhập (Email + Mật khẩu ngẫu nhiên) cho hội viên mới
   */
  async sendRegistrationAccountEmail(options: SendAccountEmailOptions): Promise<{ ok: boolean; message?: string }> {
    const { to, fullName, username, passwordRaw, companyName, memberCode, portalUrl } = options;
    const cleanTo = (to || '').trim();
    if (!cleanTo || !cleanTo.includes('@')) {
      this.logger.warn(`Cannot send account email: invalid destination email "${cleanTo}"`);
      return { ok: false, message: 'Invalid recipient email' };
    }

    const appUrl = portalUrl || 'http://14.225.217.232:5002/association/login';
    const crmUrl = 'http://14.225.217.232:5000/auth';

    const subject = `[CLB CEO 1983] Chào mừng Gia nhập — Thông tin Tài khoản Đăng nhập của Anh/Chị ${fullName}`;

    const html = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f7fb; margin: 0; padding: 20px; color: #1e293b; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 18px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #001A4D 0%, #003B95 60%, #002B70 100%); padding: 36px 28px; text-align: center; color: #ffffff; position: relative; }
    .gold-badge { display: inline-block; background: rgba(255, 215, 0, 0.2); border: 1px solid rgba(255, 215, 0, 0.5); color: #FFD700; padding: 4px 14px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 12px; }
    .title { font-size: 24px; font-weight: 900; margin: 0 0 8px 0; color: #ffffff; }
    .subtitle { font-size: 13px; color: rgba(255, 255, 255, 0.8); margin: 0; line-height: 1.5; }
    .content { padding: 32px 28px; }
    .greeting { font-size: 16px; font-weight: 600; color: #0f172a; margin-bottom: 16px; }
    .intro { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
    .card-box { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 14px; padding: 22px; margin-bottom: 24px; border-left: 4px solid #003B95; }
    .card-title { font-size: 13px; font-weight: 800; text-transform: uppercase; color: #003B95; margin-bottom: 14px; letter-spacing: 0.5px; }
    .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }
    .info-label { color: #64748b; font-weight: 500; }
    .info-value { color: #0f172a; font-weight: 700; word-break: break-all; }
    .cred-highlight { background: #e0f2fe; color: #0369a1; padding: 4px 10px; border-radius: 8px; font-family: monospace; font-size: 15px; font-weight: 800; border: 1px dashed #7dd3fc; }
    .btn-wrap { text-align: center; margin: 30px 0; }
    .btn-primary { display: inline-block; background: linear-gradient(135deg, #FFD700 0%, #FF9500 100%); color: #001a4d; font-weight: 800; font-size: 15px; text-decoration: none; padding: 14px 34px; border-radius: 9999px; box-shadow: 0 4px 14px rgba(255, 149, 0, 0.35); transition: transform 0.2s; }
    .btn-secondary { display: inline-block; background: #003B95; color: #ffffff; font-weight: 700; font-size: 13px; text-decoration: none; padding: 10px 22px; border-radius: 9999px; margin-left: 10px; }
    .note { font-size: 12px; color: #94a3b8; line-height: 1.5; background: #f1f5f9; padding: 12px 16px; border-radius: 10px; margin-top: 20px; }
    .footer { background: #0b1329; padding: 24px; text-align: center; color: rgba(255, 255, 255, 0.5); font-size: 11.5px; line-height: 1.6; }
    .footer-brand { color: #FFD700; font-weight: 700; font-size: 13px; margin-bottom: 6px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="gold-badge">✦ Chào Mừng Hội Viên Mới ✦</div>
      <h1 class="title">CLB DOANH NHÂN CEO 1983</h1>
      <p class="subtitle">Kết nối bền vững — Kiến tạo thịnh vượng — Vươn tầm doanh nhân</p>
    </div>

    <div class="content">
      <div class="greeting">Kính gửi Anh/Chị <strong>${fullName}</strong>,</div>
      <div class="intro">
        Ban Thư Ký CLB Doanh Nhân CEO 1983 xin trân trọng thông báo hồ sơ đăng ký gia nhập của Anh/Chị ${companyName ? `(đại diện cho <strong>${companyName}</strong>)` : ''} đã được tiếp nhận thành công vào hệ thống.
        <br><br>
        Dưới đây là thông tin tài khoản hội viên chính thức của Anh/Chị để đăng nhập vào <strong>App Hiệp Hội CEO 1983</strong>:
      </div>

      <div class="card-box">
        <div class="card-title">🔐 Thông Tin Đăng Nhập Hệ Thống</div>
        <div class="info-row">
          <span class="info-label">Tên đăng nhập (Email):</span>
          <span class="info-value cred-highlight">${username}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Mật khẩu khởi tạo:</span>
          <span class="info-value cred-highlight">${passwordRaw}</span>
        </div>
        ${memberCode ? `
        <div class="info-row" style="margin-top: 8px;">
          <span class="info-label">Mã số Hội viên dự kiến:</span>
          <span class="info-value" style="color: #d97706;">${memberCode}</span>
        </div>
        ` : ''}
      </div>

      <div class="btn-wrap">
        <a href="${appUrl}" class="btn-primary" target="_blank">📲 Đăng Nhập App Hiệp Hội</a>
      </div>

      <div class="note">
        <strong>* Lưu ý bảo mật:</strong> Để đảm bảo an toàn tuyệt đối, Anh/Chị vui lòng đăng nhập vào ứng dụng và thay đổi mật khẩu ngay ở lần truy cập đầu tiên tại mục <em>Tài khoản &gt; Cài đặt mật khẩu</em>.
      </div>
    </div>

    <div class="footer">
      <div class="footer-brand">CLB DOANH NHÂN CEO 1983 (HanoiBA)</div>
      <div>Văn phòng Ban Thư Ký · Hotline: 0983 1983 83 · Email: btk@ceo1983.com</div>
      <div style="margin-top: 6px;">Cổng thông tin chính thức: <a href="https://ceo1983.com" style="color: #93c5fd; text-decoration: none;">ceo1983.com</a></div>
    </div>
  </div>
</body>
</html>
    `;

    // 1. Nếu có transporter, thực hiện gửi email thật
    if (this.transporter) {
      try {
        const fromAddr = process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@ceo1983.com';
        const info = await this.transporter.sendMail({
          from: `"CLB Doanh Nhân CEO 1983" <${fromAddr}>`,
          to: cleanTo,
          subject,
          html,
        });
        this.logger.log(`Account email sent to ${cleanTo} via SMTP. MessageId: ${info.messageId}`);
        return { ok: true, message: 'Email sent successfully via SMTP' };
      } catch (err: any) {
        this.logger.error(`Failed to send email to ${cleanTo} via SMTP: ${err.message}`, err.stack);
      }
    }

    // 2. Audit logger (luôn ghi nhận đầy đủ thông tin tài khoản vào hệ thống để không bao giờ thất lạc)
    this.logger.log(
      `[MEMBER_ACCOUNT_CREATED] Destination: ${cleanTo} | User: ${username} | Password: ${passwordRaw} | Name: ${fullName}`,
    );
    return { ok: true, message: 'Account created and credentials logged to audit stream' };
  }
}
