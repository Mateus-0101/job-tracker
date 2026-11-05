import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MailModule } from '../mail/mail.module';
import { REMINDERS_QUEUE } from './reminders.constants';
import { RemindersController } from './reminders.controller';
import { RemindersNotifier } from './reminders.notifier';
import { RemindersProcessor } from './reminders.processor';
import { RemindersScheduler } from './reminders.scheduler';
import { RemindersService } from './reminders.service';

@Module({
  imports: [
    AuthModule,
    MailModule,
    BullModule.registerQueue({ name: REMINDERS_QUEUE }),
  ],
  controllers: [RemindersController],
  providers: [
    RemindersService,
    RemindersNotifier,
    RemindersProcessor,
    RemindersScheduler,
  ],
})
export class RemindersModule {}
