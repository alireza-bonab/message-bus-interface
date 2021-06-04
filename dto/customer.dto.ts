import {
  IsDate,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { BaseDTO } from './base.dto';

export class CustomerDto extends BaseDTO<CustomerDto> {
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
