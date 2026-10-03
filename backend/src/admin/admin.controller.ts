import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // System Stats Overview
  @Get('stats')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('Admin')
  getStats() {
    return this.adminService.getOverviewStats();
  }

  // Users Directory & Role Management
  @Get('users')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('Admin')
  getUsers() {
    return this.adminService.getUsers();
  }

  @Patch('users/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('Admin')
  updateUser(
    @Param('id') id: string,
    @Body() body: { role?: string; status?: string; department?: string },
  ) {
    return this.adminService.updateUser(+id, body);
  }

  // Chat Gradient Themes
  @Get('themes')
  getThemes() {
    return this.adminService.getThemes();
  }

  @Post('themes')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('Admin')
  addTheme(@Body() body: any) {
    return this.adminService.addTheme(body);
  }

  @Delete('themes/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('Admin')
  deleteTheme(@Param('id') id: string) {
    return this.adminService.deleteTheme(id);
  }

  // Wallpapers & Backgrounds
  @Get('wallpapers')
  getWallpapers() {
    return this.adminService.getWallpapers();
  }

  @Post('wallpapers')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('Admin')
  addWallpaper(@Body() body: any) {
    return this.adminService.addWallpaper(body);
  }

  @Delete('wallpapers/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('Admin')
  deleteWallpaper(@Param('id') id: string) {
    return this.adminService.deleteWallpaper(id);
  }

  // Starter Templates
  @Get('templates')
  getTemplates() {
    return this.adminService.getTemplates();
  }

  @Post('templates')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('Admin')
  addTemplate(@Body() body: any) {
    return this.adminService.addTemplate(body);
  }

  @Delete('templates/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('Admin')
  deleteTemplate(@Param('id') id: string) {
    return this.adminService.deleteTemplate(id);
  }

  // Template Categories
  @Get('categories')
  getCategories() {
    return this.adminService.getTemplateCategories();
  }

  // AI Suggestions
  @Get('ai-suggestions')
  getAiSuggestions() {
    return this.adminService.getAiSuggestions();
  }

  @Post('ai-suggestions')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('Admin')
  updateAiSuggestions(@Body() body: { suggestions: string[] }) {
    return this.adminService.updateAiSuggestions(body.suggestions);
  }

  // Workspace Settings
  @Get('settings')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('Admin')
  getSettings() {
    return this.adminService.getSystemSettings();
  }

  @Post('settings')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('Admin')
  updateSettings(@Body() body: any) {
    return this.adminService.updateSystemSettings(body);
  }
}

