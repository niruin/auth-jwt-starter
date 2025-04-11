import { ApiProperty } from '@nestjs/swagger';

export class DefaultResponse {
  @ApiProperty({ example: 'success' })
  status: 'success' | 'error';

  @ApiProperty({ example: 'Данные внесены' })
  message: string[];

  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'Не удалось сохранить данные' })
  error?: string;
}
