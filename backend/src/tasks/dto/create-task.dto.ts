import { IsString, IsOptional, IsNotEmpty, IsNumber } from 'class-validator';

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
  estimatedHours?: number;
}
