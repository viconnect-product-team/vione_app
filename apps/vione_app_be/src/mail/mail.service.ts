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

export interface SendEventTicketEmailOptions {
  to: string;
  fullName: string;
  phone?: string;
  company?: string;
  position?: string;
  eventTitle: string;
  eventDate?: string;
  eventTime?: string;
  eventLocation?: string;
  registrationId: string;
  ticketType?: string;
  ticketCount?: number;
  luckyNumber?: string;
  isFree?: boolean;
  totalAmount?: number;
  qrCodeUrl?: string;
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

    const appUrl = portalUrl || 'https://14.225.217.232:5444/association/login';
    const crmUrl = 'https://14.225.217.232:5443/auth';

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

  /**
   * Gửi email xác nhận vé sự kiện điện tử (E-Ticket) kèm thông tin người đăng ký và mã QR check-in
   */
  async sendEventTicketEmail(options: SendEventTicketEmailOptions): Promise<{ ok: boolean; message?: string }> {
    const {
      to,
      fullName,
      phone,
      company,
      position,
      eventTitle,
      eventDate,
      eventTime,
      eventLocation,
      registrationId,
      ticketType = 'Standard',
      ticketCount = 1,
      luckyNumber,
      isFree = true,
      totalAmount = 0,
      qrCodeUrl,
    } = options;

    const cleanTo = (to || '').trim();
    if (!cleanTo || !cleanTo.includes('@')) {
      this.logger.warn(`Cannot send event ticket email: invalid destination email "${cleanTo}"`);
      return { ok: false, message: 'Invalid recipient email' };
    }

    const appEventsUrl = 'https://14.225.217.232:5444/association/events';
    const qrSrc = qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(registrationId)}`;

    const subject = `[CLB CEO 1983] Vé Tham Dự Sự Kiện: ${eventTitle} — ${fullName} (#${registrationId})`;

    const html = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 20px; color: #1e293b; }
    .container { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 12px 36px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #001A4D 0%, #003B95 55%, #0B192C 100%); padding: 34px 28px; text-align: center; color: #ffffff; }
    .gold-badge { display: inline-block; background: rgba(245, 158, 11, 0.2); border: 1px solid #F59E0B; color: #FCD34D; padding: 5px 16px; border-radius: 9999px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 12px; }
    .title { font-size: 22px; font-weight: 900; margin: 0 0 6px 0; color: #ffffff; line-height: 1.3; }
    .subtitle { font-size: 12.5px; color: rgba(255, 255, 255, 0.85); margin: 0; }
    .content { padding: 30px 28px; }
    .greeting { font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }
    .intro { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 22px; }
    
    .ticket-card { background: #f8fafc; border: 2px dashed #003B95; border-radius: 16px; padding: 22px; margin-bottom: 24px; position: relative; }
    .ticket-header { border-bottom: 1px solid #cbd5e1; padding-bottom: 14px; margin-bottom: 14px; }
    .event-name { font-size: 17px; font-weight: 900; color: #003B95; margin-bottom: 4px; }
    .event-meta { font-size: 13px; color: #64748b; }
    
    .qr-container { text-align: center; margin: 24px 0 16px 0; padding: 18px; background: #ffffff; border-radius: 14px; border: 1px solid #e2e8f0; }
    .qr-img { width: 200px; height: 200px; border-radius: 10px; border: 3px solid #003B95; padding: 6px; background: #ffffff; }
    .qr-caption { font-size: 13px; font-weight: 800; color: #003B95; margin-top: 10px; font-family: monospace; letter-spacing: 1px; }
    .qr-hint { font-size: 12px; color: #64748b; margin-top: 4px; }

    .info-grid { display: table; width: 100%; font-size: 13.5px; margin-top: 12px; }
    .info-row { display: table-row; }
    .info-cell-label { display: table-cell; padding: 6px 0; color: #64748b; font-weight: 500; width: 40%; }
    .info-cell-value { display: table-cell; padding: 6px 0; color: #0f172a; font-weight: 700; text-align: right; }
    
    .badge-status { display: inline-block; background: #dcfce7; color: #15803d; padding: 3px 10px; border-radius: 9999px; font-size: 11.5px; font-weight: 800; border: 1px solid #86efac; }
    .badge-lucky { display: inline-block; background: #fef3c7; color: #b45309; padding: 3px 10px; border-radius: 9999px; font-size: 12px; font-weight: 900; border: 1px solid #fde68a; font-family: monospace; }
    
    .btn-wrap { text-align: center; margin: 28px 0 10px 0; }
    .btn-primary { display: inline-block; background: linear-gradient(135deg, #003B95 0%, #001A4D 100%); color: #ffffff !important; font-weight: 800; font-size: 14px; text-decoration: none; padding: 14px 32px; border-radius: 9999px; box-shadow: 0 4px 14px rgba(0, 59, 149, 0.35); }
    
    .checkin-guide { background: #eff6ff; border-left: 4px solid #003B95; padding: 14px 18px; border-radius: 0 12px 12px 0; margin-top: 22px; font-size: 12.5px; line-height: 1.6; color: #1e3a8a; }
    .footer { background: #0b1329; padding: 22px; text-align: center; color: rgba(255, 255, 255, 0.55); font-size: 11.5px; line-height: 1.6; }
    .footer-brand { color: #F59E0B; font-weight: 800; font-size: 13px; margin-bottom: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="gold-badge">✦ VÉ THAM DỰ SỰ KIỆN ĐIỆN TỬ (E-TICKET) ✦</div>
      <h1 class="title">CLB DOANH NHÂN CEO 1983</h1>
      <p class="subtitle">Hệ Sinh Thái Kết Nối & Giao Thương Doanh Nhân Đẳng Cấp</p>
    </div>

    <div class="content">
      <div class="greeting">Kính gửi Anh/Chị <strong>${fullName}</strong>,</div>
      <div class="intro">
        Ban Thư Ký CLB Doanh Nhân CEO 1983 xin trân trọng thông báo: Anh/Chị đã <strong>đăng ký thành công</strong> vé tham dự sự kiện dưới đây. Dưới đây là thông tin vé điện tử và <strong>Mã QR Check-in</strong> chính thức của Anh/Chị:
      </div>

      <div class="ticket-card">
        <div class="ticket-header">
          <div class="event-name">${eventTitle}</div>
          <div class="event-meta">📍 Địa điểm: <strong>${eventLocation || 'Hà Nội'}</strong></div>
          <div class="event-meta">🗓️ Thời gian: <strong>${eventDate || ''} ${eventTime ? '· ' + eventTime : ''}</strong></div>
        </div>

        <!-- MÃ QR CHECK-IN DÀNH CHO BAN TỔ CHỨC QUÉT -->
        <div class="qr-container">
          <img src="${qrSrc}" alt="Mã QR Check-in" class="qr-img" />
          <div class="qr-caption">MÃ VÉ: ${registrationId}</div>
          <div class="qr-hint">Xuất trình mã QR này tại bàn đón tiếp để Ban Tổ Chức quét check-in</div>
        </div>

        <div class="info-grid">
          <div class="info-row">
            <div class="info-cell-label">Người tham dự:</div>
            <div class="info-cell-value">${fullName}</div>
          </div>
          ${position || company ? `
          <div class="info-row">
            <div class="info-cell-label">Chức vụ & Doanh nghiệp:</div>
            <div class="info-cell-value">${position ? position + ' · ' : ''}${company || ''}</div>
          </div>
          ` : ''}
          ${phone ? `
          <div class="info-row">
            <div class="info-cell-label">Số điện thoại:</div>
            <div class="info-cell-value">${phone}</div>
          </div>
          ` : ''}
          <div class="info-row">
            <div class="info-cell-label">Loại vé & Số lượng:</div>
            <div class="info-cell-value">${ticketCount} vé (${ticketType})</div>
          </div>
          ${luckyNumber ? `
          <div class="info-row">
            <div class="info-cell-label">Số may mắn quay thưởng:</div>
            <div class="info-cell-value"><span class="badge-lucky">Lucky #${luckyNumber}</span></div>
          </div>
          ` : ''}
          <div class="info-row">
            <div class="info-cell-label">Trạng thái vé:</div>
            <div class="info-cell-value">
              <span class="badge-status">${isFree ? '✓ ĐÃ XÁC NHẬN (Miễn phí 0 đ)' : '✓ ĐÃ TIẾP NHẬN'}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="checkin-guide">
        <strong>📌 Hướng dẫn Check-in tại sự kiện:</strong>
        <br>1. Khi đến địa điểm tổ chức, Anh/Chị vui lòng mở email này hoặc truy cập ứng dụng App Hiệp Hội.
        <br>2. Xuất trình <strong>Mã QR vé</strong> trên cho Ban Thư Ký / Ban Tổ Chức tại bàn đón tiếp để quét check-in và nhận thẻ đại biểu cùng tài liệu sự kiện.
      </div>

      <div class="btn-wrap">
        <a href="${appEventsUrl}" class="btn-primary" target="_blank">📲 Mở Thẻ Vé Trên App Hiệp Hội</a>
      </div>
    </div>

    <div class="footer">
      <div class="footer-brand">CLB DOANH NHÂN CEO 1983 (HanoiBA)</div>
      <div>Văn phòng Ban Thư Ký · Hotline: 0983 1983 83 · Email: btk@ceo1983.com</div>
      <div style="margin-top: 4px;">Cổng thông tin & Ứng dụng: <a href="https://14.225.217.232:5444" style="color: #93c5fd; text-decoration: none;">14.225.217.232:5444</a></div>
    </div>
  </div>
</body>
</html>
    `;

    // 1. Gửi qua SMTP nếu đã cấu hình transporter
    if (this.transporter) {
      try {
        const fromAddr = process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@ceo1983.com';
        const info = await this.transporter.sendMail({
          from: `"Ban Tổ Chức Sự Kiện CEO 1983" <${fromAddr}>`,
          to: cleanTo,
          subject,
          html,
        });
        this.logger.log(`Event ticket email sent to ${cleanTo} via SMTP. RegistrationId: ${registrationId}, MessageId: ${info.messageId}`);
        return { ok: true, message: 'Event ticket email sent successfully via SMTP' };
      } catch (err: any) {
        this.logger.error(`Failed to send event ticket email to ${cleanTo} via SMTP: ${err.message}`, err.stack);
      }
    }

    // 2. Audit log
    this.logger.log(
      `[EVENT_TICKET_EMAIL_DISPATCHED] To: ${cleanTo} | Event: ${eventTitle} | RegId: ${registrationId} | Name: ${fullName} | LuckyNum: ${luckyNumber}`,
    );
    return { ok: true, message: 'Event ticket created and notification logged to audit stream' };
  }
}

