import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class InviteMemberDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNumber()
  @IsNotEmpty()
  roleId: number;

  @IsString()
  @IsOptional()
  customRoleLabel?: string;
}

export class UpdateMemberDto {
  @IsNumber()
  @IsOptional()
  roleId?: number;

  @IsString()
  @IsOptional()
  customRoleLabel?: string;

  @IsString()
  @IsOptional()
  status?: string;
}
