import { IsString, IsOptional, IsNumber, IsArray } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  teamId?: number;

  @IsNumber()
  @IsOptional()
  workspaceId?: number;

  @IsNumber()
  @IsOptional()
  managerId?: number;

  @IsArray()
  @IsOptional()
  assignedUserIds?: number[];

  @IsString()
  @IsOptional()
  status?: string;
}
