import { IsString, IsOptional, IsNotEmpty, IsNumber, IsDateString } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  priority?: string;

  @IsNumber()
  @IsOptional()
  projectId?: number;

  @IsString()
  @IsOptional()
  channelId?: string;

  @IsNumber()
  @IsOptional()
  sprintId?: number;

  @IsNumber()
  @IsOptional()
  assigneeId?: number;

  @IsNumber()
  @IsOptional()
  workspaceId?: number;

  @IsNumber()
  @IsOptional()
  boardId?: number;

  @IsNumber()
  @IsOptional()
  boardListId?: number;

  @IsNumber()
  @IsOptional()
  order?: number;

  @IsNumber()
  @IsOptional()
  estimatedHours?: number;

  @IsNumber()
  @IsOptional()
  storyPoints?: number;

  @IsString()
  @IsOptional()
  issueType?: string;

  @IsString()
  @IsOptional()
  coverColor?: string;

  @IsDateString()
  @IsOptional()
  dueDate?: string;
}
