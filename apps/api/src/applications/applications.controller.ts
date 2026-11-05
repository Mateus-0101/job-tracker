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
  createApplicationSchema,
  listApplicationsQuerySchema,
  updateApplicationSchema,
  updateStatusSchema,
} from '@job-tracker/shared';
import type {
  CreateApplicationInput,
  ListApplicationsQuery,
  UpdateApplicationInput,
  UpdateStatusInput,
} from '@job-tracker/shared';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUserId } from '../auth/current-user.decorator';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { ApplicationsService } from './applications.service';

@Controller('applications')
@UseGuards(AuthGuard)
export class ApplicationsController {
  constructor(private readonly applications: ApplicationsService) {}

  @Post()
  create(
    @CurrentUserId() userId: string,
    @Body(new ZodValidationPipe(createApplicationSchema))
    body: CreateApplicationInput,
  ) {
    return this.applications.create(userId, body);
  }

  @Get()
  findAll(
    @CurrentUserId() userId: string,
    @Query(new ZodValidationPipe(listApplicationsQuerySchema))
    query: ListApplicationsQuery,
  ) {
    return this.applications.findAll(userId, query);
  }

  @Get(':id')
  findOne(@CurrentUserId() userId: string, @Param('id') id: string) {
    return this.applications.findOne(userId, id);
  }

  @Patch(':id')
  update(
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateApplicationSchema))
    body: UpdateApplicationInput,
  ) {
    return this.applications.update(userId, id, body);
  }

  @Patch(':id/status')
  updateStatus(
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateStatusSchema)) body: UpdateStatusInput,
  ) {
    return this.applications.updateStatus(userId, id, body.status);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@CurrentUserId() userId: string, @Param('id') id: string) {
    return this.applications.remove(userId, id);
  }
}
