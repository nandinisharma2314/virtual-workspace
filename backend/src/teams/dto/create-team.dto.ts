import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateTeamDto {
  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  workspaceId?: number;

  @IsNumber()
  @IsOptional()
  leadId?: number;

  @IsNumber()
  @IsOptional()
  managerId?: number;
}
