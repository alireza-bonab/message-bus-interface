import {
  IsDate,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { BaseDTO } from './base.dto';

export class SaleInvoiceDto extends BaseDTO<SaleInvoiceDto> {
  @IsInt()
  @Min(1)
  id: number;

  @IsString()
  @IsNotEmpty()
  customerName: string;

  @IsDate()
  @IsOptional()
  createdAt: Date;
}
