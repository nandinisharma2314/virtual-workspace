import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service.js';
import { LoginDto } from './dto/login-dto.js';
import { CreateUserDto } from '../users/dto/create-user.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    const payload = { sub: user.id, email: user.email, name: user.name, role: user.role };
    return {
      user,
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, name: user.name, role: user.role };
    
    // Omit password from returned user object
    const { password, ...userWithoutPassword } = user;
    
    return {
      user: userWithoutPassword,
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return { message: 'Reset link sent' };
    }

    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const expires = new Date(Date.now() + 3600000); // 1 hour
    
    await this.usersService.saveResetToken(user.id, token, expires);

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    console.log(`[Email Mock] Sent password reset email to ${email}. Reset Link: ${frontendUrl}/reset-password?token=${token}`);

    return { message: 'Reset link sent' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.usersService.findByResetToken(token);
    
    if (!user) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    if (user.resetPasswordExpires && new Date() > user.resetPasswordExpires) {
      throw new UnauthorizedException('Reset token has expired');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.usersService.updatePassword(user.id, hashedPassword);

    return { message: 'Password reset successfully' };
  }

  async getProfile(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const { password, resetPasswordToken, resetPasswordExpires, ...safeUser } = user;
    return safeUser;
  }

  async updateProfile(email: string, data: { name?: string; email?: string; bio?: string; role?: string; avatar?: string; language?: string; timezone?: string; emailNotifications?: boolean; pushNotifications?: boolean; inAppNotifications?: boolean }) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    
    // Security: Only Admins can change their role. Ignore the role field if they are not an Admin.
    if (data.role && user.role !== 'Admin') {
      delete data.role;
    }

    await this.usersService.updateProfile(user.id, data);
    return { message: 'Profile updated successfully' };
  }

  async deleteAccount(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    await this.usersService.deleteUser(user.id);
    return { message: 'Account deleted successfully' };
  }

  async changePassword(email: string, currentPassword: string, newPassword: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid current password');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.usersService.updatePassword(user.id, hashedPassword);
    return { message: 'Password updated successfully' };
  }
}
