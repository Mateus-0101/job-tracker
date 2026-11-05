import { Processor, WorkerHost } from '@nestjs/bullmq';
import { REMINDERS_QUEUE } from './reminders.constants';
import { RemindersNotifier } from './reminders.notifier';

@Processor(REMINDERS_QUEUE)
export class RemindersProcessor extends WorkerHost {
  constructor(private readonly notifier: RemindersNotifier) {
    super();
  }

  async process(): Promise<number> {
    return this.notifier.notifyDue();
  }
}
