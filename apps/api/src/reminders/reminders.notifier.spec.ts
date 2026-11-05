import { Test } from '@nestjs/testing';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { RemindersNotifier } from './reminders.notifier';

jest.mock('../prisma/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));
jest.mock('../mail/mail.service', () => ({
  MailService: class MailService {},
}));

describe('RemindersNotifier', () => {
  let notifier: RemindersNotifier;

  const prismaMock = {
    reminder: {
      findMany: jest.fn(),
      updateMany: jest.fn(),
      update: jest.fn(),
    },
  };
  const mailMock = { sendReminder: jest.fn() };

  const now = new Date('2026-11-05T12:00:00Z');
  const due = {
    id: 'rem-1',
    title: 'Follow-up',
    dueAt: new Date('2026-11-05T11:00:00Z'),
    application: {
      company: 'Acme',
      position: 'Dev',
      user: { email: 'me@example.com' },
    },
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        RemindersNotifier,
        { provide: PrismaService, useValue: prismaMock },
        { provide: MailService, useValue: mailMock },
      ],
    }).compile();

    notifier = moduleRef.get(RemindersNotifier);
  });

  it('queries only pending, not yet notified and overdue reminders', async () => {
    prismaMock.reminder.findMany.mockResolvedValue([]);

    await notifier.notifyDue(now);

    expect(prismaMock.reminder.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { done: false, notifiedAt: null, dueAt: { lte: now } },
      }),
    );
  });

  it('sends one email and marks the reminder as notified', async () => {
    prismaMock.reminder.findMany.mockResolvedValue([due]);
    prismaMock.reminder.updateMany.mockResolvedValue({ count: 1 });
    mailMock.sendReminder.mockResolvedValue(undefined);

    const sent = await notifier.notifyDue(now);

    expect(sent).toBe(1);
    expect(prismaMock.reminder.updateMany).toHaveBeenCalledWith({
      where: { id: 'rem-1', notifiedAt: null },
      data: { notifiedAt: now },
    });
    expect(mailMock.sendReminder).toHaveBeenCalledWith(
      'me@example.com',
      expect.objectContaining({ title: 'Follow-up', company: 'Acme' }),
    );
  });

  it('skips a reminder already claimed by another run (no duplicate email)', async () => {
    prismaMock.reminder.findMany.mockResolvedValue([due]);
    prismaMock.reminder.updateMany.mockResolvedValue({ count: 0 });

    const sent = await notifier.notifyDue(now);

    expect(sent).toBe(0);
    expect(mailMock.sendReminder).not.toHaveBeenCalled();
  });

  it('releases the reminder for retry when sending fails', async () => {
    prismaMock.reminder.findMany.mockResolvedValue([due]);
    prismaMock.reminder.updateMany.mockResolvedValue({ count: 1 });
    mailMock.sendReminder.mockRejectedValue(new Error('smtp down'));

    const sent = await notifier.notifyDue(now);

    expect(sent).toBe(0);
    expect(prismaMock.reminder.update).toHaveBeenCalledWith({
      where: { id: 'rem-1' },
      data: { notifiedAt: null },
    });
  });
});
