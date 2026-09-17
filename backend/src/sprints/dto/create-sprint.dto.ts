import { IsString, IsOptional, IsNumber, IsDateString } from 'class-validator';

export class CreateSprintDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsNumber()
  @IsOptional()
  projectId?: number;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;
}
