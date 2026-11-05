import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  createReminderSchema,
  listRemindersQuerySchema,
  updateReminderSchema,
} from '@job-tracker/shared';
import type {
  CreateReminderInput,
  ListRemindersQuery,
  UpdateReminderInput,
} from '@job-tracker/shared';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUserId } from '../auth/current-user.decorator';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { RemindersService } from './reminders.service';

@Controller()
@UseGuards(AuthGuard)
export class RemindersController {
  constructor(private readonly reminders: RemindersService) {}

  @Post('applications/:applicationId/reminders')
  create(
    @CurrentUserId() userId: string,
    @Param('applicationId') applicationId: string,
    @Body(new ZodValidationPipe(createReminderSchema))
    body: CreateReminderInput,
  ) {
    return this.reminders.create(userId, applicationId, body);
  }

  @Get('reminders')
  findAll(
    @CurrentUserId() userId: string,
    @Query(new ZodValidationPipe(listRemindersQuerySchema))
    query: ListRemindersQuery,
  ) {
    return this.reminders.findAll(userId, query);
  }

  @Patch('reminders/:id')
  update(
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateReminderSchema))
    body: UpdateReminderInput,
  ) {
    return this.reminders.update(userId, id, body);
  }

  @Delete('reminders/:id')
  @HttpCode(204)
  remove(@CurrentUserId() userId: string, @Param('id') id: string) {
    return this.reminders.remove(userId, id);
  }
}
