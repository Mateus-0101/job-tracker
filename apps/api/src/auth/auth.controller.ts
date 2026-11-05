import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'node:crypto';
import type { Request, Response } from 'express';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import {
  readCookie,
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  STATE_COOKIE,
} from './auth.utils';
import type { AuthenticatedRequest } from './auth.utils';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
  ) {}

  private get cookieOptions() {
    return {
      httpOnly: true,
      sameSite: 'lax' as const,
      secure: process.env.NODE_ENV === 'production',
    };
  }

  @Get('google')
  login(@Res() res: Response) {
    const state = randomBytes(16).toString('hex');
    res.cookie(STATE_COOKIE, state, {
      ...this.cookieOptions,
      maxAge: 10 * 60 * 1000,
    });
    res.redirect(this.auth.getAuthUrl(state));
  }

  @Get('google/callback')
  async callback(
    @Query('code') code: string | undefined,
    @Query('state') state: string | undefined,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const savedState = readCookie(req, STATE_COOKIE);
    if (!code || !state || state !== savedState) {
      throw new BadRequestException('Invalid OAuth state');
    }

    const token = await this.auth.loginWithCode(code);

    res.clearCookie(STATE_COOKIE);
    res.cookie(SESSION_COOKIE, token, {
      ...this.cookieOptions,
      maxAge: SESSION_MAX_AGE_SECONDS * 1000,
    });
    res.redirect(
      this.config.get<string>('WEB_ORIGIN') ?? 'http://localhost:5173',
    );
  }

  @Get('me')
  @UseGuards(AuthGuard)
  me(@Req() req: AuthenticatedRequest) {
    return this.auth.getUser(req.userId);
  }

  @Post('logout')
  @HttpCode(204)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(SESSION_COOKIE, this.cookieOptions);
  }
}
