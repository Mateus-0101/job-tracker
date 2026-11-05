import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { RemindersService } from './reminders.service';

jest.mock('../prisma/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

describe('RemindersService', () => {
  let service: RemindersService;

  const prismaMock = {
    application: { findFirst: jest.fn() },
    reminder: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const dueAt = new Date('2026-12-01T12:00:00Z');

  beforeEach(async () => {
    jest.resetAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        RemindersService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = moduleRef.get(RemindersService);
  });

  it('creates a reminder for an application owned by the user', async () => {
    prismaMock.application.findFirst.mockResolvedValue({ id: 'app-1' });
    prismaMock.reminder.create.mockResolvedValue({ id: 'rem-1' });

    await service.create('user-1', 'app-1', { title: 'Follow-up', dueAt });

    expect(prismaMock.application.findFirst).toHaveBeenCalledWith({
      where: { id: 'app-1', userId: 'user-1' },
      select: { id: true },
    });
    expect(prismaMock.reminder.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { title: 'Follow-up', dueAt, applicationId: 'app-1' },
      }),
    );
  });

  it('does not create a reminder on someone else application', async () => {
    prismaMock.application.findFirst.mockResolvedValue(null);

    await expect(
      service.create('user-2', 'app-1', { title: 'x', dueAt }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prismaMock.reminder.create).not.toHaveBeenCalled();
  });

  it('lists only the reminders of the user, filtered by done', async () => {
    prismaMock.reminder.findMany.mockResolvedValue([]);

    await service.findAll('user-1', { done: false });

    expect(prismaMock.reminder.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { done: false, application: { userId: 'user-1' } },
        orderBy: { dueAt: 'asc' },
      }),
    );
  });

  it('marks an owned reminder as done', async () => {
    prismaMock.reminder.findFirst.mockResolvedValue({ id: 'rem-1' });
    prismaMock.reminder.update.mockResolvedValue({ id: 'rem-1', done: true });

    await service.update('user-1', 'rem-1', { done: true });

    expect(prismaMock.reminder.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'rem-1' }, data: { done: true } }),
    );
  });

  it('does not update a reminder that belongs to someone else', async () => {
    prismaMock.reminder.findFirst.mockResolvedValue(null);

    await expect(
      service.update('user-2', 'rem-1', { done: true }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prismaMock.reminder.update).not.toHaveBeenCalled();
  });

  it('does not remove a reminder that belongs to someone else', async () => {
    prismaMock.reminder.findFirst.mockResolvedValue(null);

    await expect(service.remove('user-2', 'rem-1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(prismaMock.reminder.delete).not.toHaveBeenCalled();
  });
});
