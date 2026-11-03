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
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { ApplicationsService } from './applications.service';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applications: ApplicationsService) {}

  @Post()
  create(
    @Body(new ZodValidationPipe(createApplicationSchema))
    body: CreateApplicationInput,
  ) {
    return this.applications.create(body);
  }

  @Get()
  findAll(
    @Query(new ZodValidationPipe(listApplicationsQuerySchema))
    query: ListApplicationsQuery,
  ) {
    return this.applications.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.applications.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateApplicationSchema))
    body: UpdateApplicationInput,
  ) {
    return this.applications.update(id, body);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateStatusSchema)) body: UpdateStatusInput,
  ) {
    return this.applications.updateStatus(id, body.status);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.applications.remove(id);
  }
}