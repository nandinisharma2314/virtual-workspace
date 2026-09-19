import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { FilesService } from './files.service.js';
import { CreateFileDto } from './dto/create-file.dto.js';
import { UpdateFileDto } from './dto/update-file.dto.js';
import { AuthGuard } from '../auth/auth.guard.js';

@Controller('files')
@UseGuards(AuthGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get('upload-url')
  getUploadUrl(
    @Query('filename') filename: string,
    @Query('contentType') contentType: string,
  ) {
    if (!filename || !contentType) {
      throw new BadRequestException('filename and contentType query parameters are required');
    }
    return this.filesService.generateUploadUrl(filename, contentType);
  }

  @Get(':id/download-url')
  getDownloadUrl(@Param('id') id: string) {
    return this.filesService.generateDownloadUrl(+id);
  }

  @Post()
  async create(@Body() createFileDto: CreateFileDto, @Req() req: any) {
    try {
      const userId = req.user.sub;
      return await this.filesService.create(createFileDto, userId);
    } catch (err: any) {
      throw new InternalServerErrorException(`FilesController error: ${err.message || JSON.stringify(err)}`);
    }
  }

  @Get()
  findAll(@Query('projectId') projectId?: string) {
    return this.filesService.findAll(projectId ? +projectId : undefined);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.filesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFileDto: UpdateFileDto) {
    return this.filesService.update(+id, updateFileDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.filesService.remove(+id);
  }
}
