import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateMeetingDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  startTime: string; // ISO string

  @IsString()
  @IsNotEmpty()
  endTime: string; // ISO string
}
