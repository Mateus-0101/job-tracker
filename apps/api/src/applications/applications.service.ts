import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  ApplicationStatus,
  CreateApplicationInput,
  ListApplicationsQuery,
  UpdateApplicationInput,
} from '@job-tracker/shared';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ApplicationsService {
  constructor(private readonly prisma: PrismaService) {}

  create(userId: string, input: CreateApplicationInput) {
    return this.prisma.application.create({ data: { ...input, userId } });
  }

  findAll(userId: string, query: ListApplicationsQuery) {
    return this.prisma.application.findMany({
      where: { userId, status: query.status },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const application = await this.prisma.application.findFirst({
      where: { id, userId },
    });
    if (!application) {
      throw new NotFoundException(`Application ${id} not found`);
    }
    return application;
  }

  async update(userId: string, id: string, input: UpdateApplicationInput) {
    await this.findOne(userId, id);
    return this.prisma.application.update({ where: { id }, data: input });
  }

  async updateStatus(userId: string, id: string, status: ApplicationStatus) {
    await this.findOne(userId, id);
    return this.prisma.application.update({ where: { id }, data: { status } });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    await this.prisma.application.delete({ where: { id } });
  }
}
