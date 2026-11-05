import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { ApplicationsService } from './applications.service';

jest.mock('../prisma/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

describe('ApplicationsService', () => {
  let service: ApplicationsService;

  const prismaMock = {
    application: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        ApplicationsService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = moduleRef.get(ApplicationsService);
  });

  it('creates an application linked to the given user', async () => {
    prismaMock.application.create.mockResolvedValue({ id: 'app-1' });

    await service.create('user-1', { company: 'Acme', position: 'Dev' });

    expect(prismaMock.application.create).toHaveBeenCalledWith({
      data: { company: 'Acme', position: 'Dev', userId: 'user-1' },
    });
  });

  it('lists only the given user applications, filtered by status', async () => {
    prismaMock.application.findMany.mockResolvedValue([]);

    await service.findAll('user-1', { status: 'INTERVIEW' });

    expect(prismaMock.application.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-1', status: 'INTERVIEW' },
      orderBy: { updatedAt: 'desc' },
    });
  });

  it('looks up an application scoped to the user', async () => {
    prismaMock.application.findFirst.mockResolvedValue({ id: 'app-1' });

    await service.findOne('user-1', 'app-1');

    expect(prismaMock.application.findFirst).toHaveBeenCalledWith({
      where: { id: 'app-1', userId: 'user-1' },
    });
  });

  it('throws NotFoundException when the application does not exist', async () => {
    prismaMock.application.findFirst.mockResolvedValue(null);

    await expect(service.findOne('user-1', 'missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('updates the status of an existing application', async () => {
    prismaMock.application.findFirst.mockResolvedValue({ id: 'app-1' });
    prismaMock.application.update.mockResolvedValue({
      id: 'app-1',
      status: 'OFFER',
    });

    await service.updateStatus('user-1', 'app-1', 'OFFER');

    expect(prismaMock.application.update).toHaveBeenCalledWith({
      where: { id: 'app-1' },
      data: { status: 'OFFER' },
    });
  });

  it('does not update an application that belongs to someone else', async () => {
    prismaMock.application.findFirst.mockResolvedValue(null);

    await expect(
      service.updateStatus('user-2', 'app-1', 'OFFER'),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prismaMock.application.update).not.toHaveBeenCalled();
  });

  it('does not remove an application that belongs to someone else', async () => {
    prismaMock.application.findFirst.mockResolvedValue(null);

    await expect(service.remove('user-2', 'app-1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(prismaMock.application.delete).not.toHaveBeenCalled();
  });

  it('removes an existing application', async () => {
    prismaMock.application.findFirst.mockResolvedValue({ id: 'app-1' });

    await service.remove('user-1', 'app-1');

    expect(prismaMock.application.delete).toHaveBeenCalledWith({
      where: { id: 'app-1' },
    });
  });
});
