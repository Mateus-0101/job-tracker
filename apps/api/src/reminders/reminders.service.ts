import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  CreateReminderInput,
  ListRemindersQuery,
  UpdateReminderInput,
} from '@job-tracker/shared';
import { PrismaService } from '../prisma/prisma.service';

const withApplication = {
  application: { select: { id: true, company: true, position: true } },
};

@Injectable()
export class RemindersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    applicationId: string,
    input: CreateReminderInput,
  ) {
    const application = await this.prisma.application.findFirst({
      where: { id: applicationId, userId },
      select: { id: true },
    });
    if (!application) {
      throw new NotFoundException(`Application ${applicationId} not found`);
    }

    return this.prisma.reminder.create({
      data: { ...input, applicationId },
      include: withApplication,
    });
  }

  findAll(userId: string, query: ListRemindersQuery) {
    return this.prisma.reminder.findMany({
      where: { done: query.done, application: { userId } },
      orderBy: { dueAt: 'asc' },
      include: withApplication,
    });
  }

  private async findOwned(userId: string, id: string) {
    const reminder = await this.prisma.reminder.findFirst({
      where: { id, application: { userId } },
      select: { id: true },
    });
    if (!reminder) throw new NotFoundException(`Reminder ${id} not found`);
  }

  async update(userId: string, id: string, input: UpdateReminderInput) {
    await this.findOwned(userId, id);
    return this.prisma.reminder.update({
      where: { id },
      data: input,
      include: withApplication,
    });
  }

  async remove(userId: string, id: string) {
    await this.findOwned(userId, id);
    await this.prisma.reminder.delete({ where: { id } });
  }
}
