import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class CreateBoardDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  bgGradient?: string;

  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean;

  @IsNumber()
  @IsOptional()
  projectId?: number;

  @IsNumber()
  @IsOptional()
  workspaceId?: number;

  @IsString()
  @IsOptional()
  templateId?: string;
}

export class UpdateBoardDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  bgGradient?: string;

  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean;
}

export class CreateBoardListDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  accent?: string;

  @IsNumber()
  @IsOptional()
  position?: number;
}

export class UpdateBoardListDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  accent?: string;

  @IsNumber()
  @IsOptional()
  position?: number;
}

export class MoveCardDto {
  @IsNumber()
  taskId: number;

  @IsNumber()
  targetListId: number;

  @IsNumber()
  @IsOptional()
  newOrder?: number;

  @IsString()
  @IsOptional()
  status?: string;
}
