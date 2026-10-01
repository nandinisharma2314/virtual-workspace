import { IsString, IsOptional, IsNumber } from 'class-validator';

export class UpdateTeamDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  leadId?: number | null;

  @IsNumber()
  @IsOptional()
  managerId?: number | null;
}
