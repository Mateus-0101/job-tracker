import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Queue } from 'bullmq';
import { REMINDERS_QUEUE } from './reminders.constants';

@Injectable()
export class RemindersScheduler implements OnModuleInit {
  constructor(@InjectQueue(REMINDERS_QUEUE) private readonly queue: Queue) {}

  async onModuleInit() {
    // upsert: reiniciar a API não cria agendamentos duplicados
    await this.queue.upsertJobScheduler(
      'check-due-reminders',
      { every: 60_000 },
      { name: 'check-due-reminders' },
    );
  }
}
