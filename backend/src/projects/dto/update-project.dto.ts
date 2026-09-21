import { IsString, IsOptional, IsNumber } from 'class-validator';

export class UpdateProjectDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  teamId?: number;

  @IsString()
  @IsOptional()
  status?: string;
}
