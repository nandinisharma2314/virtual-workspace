export class CreateFileDto {
  name: string;
  url: string;
  size?: number;
  type?: string;
  projectId?: number;
}
