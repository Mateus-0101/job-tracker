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

  // TEMPORÁRIO: enquanto não há autenticação, usamos um usuário fixo.
  // Quando o login com Google entrar, este método é substituído pelo usuário logado.
  private devUserId?: Promise<string>;
  private currentUserId(): Promise<string> {
    this.devUserId ??= this.prisma.user
      .upsert({
        where: { email: 'dev@jobtracker.local' },
        update: {},
        create: { email: 'dev@jobtracker.local', name: 'Dev User' },
        select: { id: true },
      })
      .then((user) => user.id);
    return this.devUserId;
  }

  async create(input: CreateApplicationInput) {
    const userId = await this.currentUserId();
    return this.prisma.application.create({ data: { ...input, userId } });
  }

  async findAll(query: ListApplicationsQuery) {
    const userId = await this.currentUserId();
    return this.prisma.application.findMany({
      where: { userId, status: query.status },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const userId = await this.currentUserId();
    const application = await this.prisma.application.findFirst({
      where: { id, userId },
    });
    if (!application) {
      throw new NotFoundException(`Application ${id} not found`);
    }
    return application;
  }

  async update(id: string, input: UpdateApplicationInput) {
    await this.findOne(id);
    return this.prisma.application.update({ where: { id }, data: input });
  }

  async updateStatus(id: string, status: ApplicationStatus) {
    await this.findOne(id);
    return this.prisma.application.update({ where: { id }, data: { status } });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.application.delete({ where: { id } });
  }
}
