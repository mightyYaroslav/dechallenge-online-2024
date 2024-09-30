import { ApiProperty } from '@nestjs/swagger';
import { Controller } from '@nestjs/common';
import { CategoryService } from './category.service';
import { Expose, plainToInstance } from 'class-transformer';

class CategoryResponse {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  title: string;
}

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  async getCategories(): Promise<CategoryResponse[]> {
    const categories = await this.categoryService.getCategories();
    return categories.map((c) => plainToInstance(CategoryResponse, c));
  }
}
