import { Injectable, Logger } from '@nestjs/common';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RemindersNotifier {
  private readonly logger = new Logger(RemindersNotifier.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  /** Envia o e-mail dos lembretes vencidos que ainda não foram avisados. */
  async notifyDue(now = new Date()): Promise<number> {
    const due = await this.prisma.reminder.findMany({
      where: { done: false, notifiedAt: null, dueAt: { lte: now } },
      orderBy: { dueAt: 'asc' },
      take: 100,
      include: {
        application: {
          select: {
            company: true,
            position: true,
            user: { select: { email: true } },
          },
        },
      },
    });

    let sent = 0;
    for (const reminder of due) {
      // "reserva" o lembrete: se outra execução já pegou, count será 0 e pulamos
      const claimed = await this.prisma.reminder.updateMany({
        where: { id: reminder.id, notifiedAt: null },
        data: { notifiedAt: now },
      });
      if (claimed.count === 0) continue;

      try {
        await this.mail.sendReminder(reminder.application.user.email, {
          title: reminder.title,
          dueAt: reminder.dueAt,
          company: reminder.application.company,
          position: reminder.application.position,
        });
        sent++;
      } catch (error) {
        // devolve o lembrete à fila: a próxima execução tenta de novo
        await this.prisma.reminder.update({
          where: { id: reminder.id },
          data: { notifiedAt: null },
        });
        this.logger.error(
          `Failed to send reminder ${reminder.id}: ${String(error)}`,
        );
      }
    }

    if (sent > 0) this.logger.log(`Sent ${sent} reminder email(s)`);
    return sent;
  }
}
