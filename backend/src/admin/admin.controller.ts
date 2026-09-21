import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service.js';
import { AuthGuard } from '../auth/auth.guard.js';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // System Stats Overview
  @Get('stats')
  @UseGuards(AuthGuard)
  getStats() {
    return this.adminService.getOverviewStats();
  }

  // Users Directory & Role Management
  @Get('users')
  @UseGuards(AuthGuard)
  getUsers() {
    return this.adminService.getUsers();
  }

  @Patch('users/:id')
  @UseGuards(AuthGuard)
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
  @UseGuards(AuthGuard)
  addTheme(@Body() body: any) {
    return this.adminService.addTheme(body);
  }

  @Delete('themes/:id')
  @UseGuards(AuthGuard)
  deleteTheme(@Param('id') id: string) {
    return this.adminService.deleteTheme(id);
  }

  // Wallpapers & Backgrounds
  @Get('wallpapers')
  getWallpapers() {
    return this.adminService.getWallpapers();
  }

  @Post('wallpapers')
  @UseGuards(AuthGuard)
  addWallpaper(@Body() body: any) {
    return this.adminService.addWallpaper(body);
  }

  @Delete('wallpapers/:id')
  @UseGuards(AuthGuard)
  deleteWallpaper(@Param('id') id: string) {
    return this.adminService.deleteWallpaper(id);
  }

  // Starter Templates
  @Get('templates')
  getTemplates() {
    return this.adminService.getTemplates();
  }

  @Post('templates')
  @UseGuards(AuthGuard)
  addTemplate(@Body() body: any) {
    return this.adminService.addTemplate(body);
  }

  @Delete('templates/:id')
  @UseGuards(AuthGuard)
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
  @UseGuards(AuthGuard)
  updateAiSuggestions(@Body() body: { suggestions: string[] }) {
    return this.adminService.updateAiSuggestions(body.suggestions);
  }

  // Workspace Settings
  @Get('settings')
  getSettings() {
    return this.adminService.getSystemSettings();
  }

  @Post('settings')
  @UseGuards(AuthGuard)
  updateSettings(@Body() body: any) {
    return this.adminService.updateSystemSettings(body);
  }
}

