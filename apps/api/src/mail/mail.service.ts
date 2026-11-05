import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport } from 'nodemailer';

export interface ReminderEmail {
  title: string;
  dueAt: Date;
  company: string;
  position: string;
}

@Injectable()
export class MailService {
  private readonly transporter;
  private readonly from: string;

  constructor(config: ConfigService) {
    const user = config.get<string>('SMTP_USER');
    const pass = config.get<string>('SMTP_PASS');

    this.transporter = createTransport({
      host: config.get<string>('SMTP_HOST', 'localhost'),
      port: Number(config.get<string>('SMTP_PORT', '1025')),
      auth: user && pass ? { user, pass } : undefined,
    });
    this.from = config.get<string>(
      'MAIL_FROM',
      'Job Tracker <no-reply@jobtracker.local>',
    );
  }

  async sendReminder(to: string, reminder: ReminderEmail) {
    const due = reminder.dueAt.toLocaleString('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    });

    await this.transporter.sendMail({
      from: this.from,
      to,
      subject: `Lembrete: ${reminder.title}`,
      text: [
        reminder.title,
        '',
        `Candidatura: ${reminder.position} · ${reminder.company}`,
        `Prazo: ${due}`,
      ].join('\n'),
    });
  }
}
