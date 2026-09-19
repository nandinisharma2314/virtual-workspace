import { Controller, Post, Body, HttpCode, HttpStatus, Get, Put, Delete, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { AuthGuard } from './auth.guard.js';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login-dto.js';
import { CreateUserDto } from '../users/dto/create-user.dto.js';
import { ResetPasswordDto, ForgotPasswordDto } from './dto/reset-password.dto.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('forgot-password')
  forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.authService.forgotPassword(body.email);
  }

  @HttpCode(HttpStatus.OK)
  @Post('reset-password')
  resetPassword(@Body() body: ResetPasswordDto) {
    return this.authService.resetPassword(body.token, body.password);
  }

  @UseGuards(AuthGuard)
  @Get('me')
  async getProfile(@Request() req) {
    return this.authService.getProfile(req.user.email);
  }

  @UseGuards(AuthGuard)
  @Put('me')
  async updateProfile(@Request() req, @Body() body: { name?: string; email?: string; bio?: string; role?: string; avatar?: string; language?: string; timezone?: string; emailNotifications?: boolean; pushNotifications?: boolean; inAppNotifications?: boolean }) {
    return this.authService.updateProfile(req.user.email, body);
  }

  @UseGuards(AuthGuard)
  @Delete('me')
  async deleteAccount(@Request() req) {
    return this.authService.deleteAccount(req.user.email);
  }

  @UseGuards(AuthGuard)
  @Put('password')
  async changePassword(@Request() req, @Body() body: any) {
    if (!body.currentPassword || !body.newPassword) {
      throw new BadRequestException('Current and new password are required');
    }
    return this.authService.changePassword(req.user.email, body.currentPassword, body.newPassword);
  }
}
