import { ApiOkResponse, ApiProperty, ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { Expose, plainToInstance } from 'class-transformer';
import { IsInt, IsString } from 'class-validator';

class CategoryResponse {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  title: string;
}

class CategoryInput {
  @IsInt()
  @ApiProperty()
  id: number;

  @IsString()
  @ApiProperty()
  title: string;
}

@ApiTags('Categories API')
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @ApiOkResponse({ type: CategoryResponse, isArray: true })
  async getCategories(): Promise<CategoryResponse[]> {
    const categories = await this.categoryService.getCategories();
    return categories.map((c) => plainToInstance(CategoryResponse, c));
  }

  @Post()
  @ApiOkResponse({ type: CategoryResponse })
  async createCategory(
    @Body() input: CategoryInput,
  ): Promise<CategoryResponse> {
    const category = await this.categoryService.createCategory(input);
    return plainToInstance(CategoryResponse, category);
  }

  @Delete(':id')
  @ApiOkResponse({ type: CategoryResponse })
  async removeCategory(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CategoryResponse> {
    const category = await this.categoryService.removeCategory({ id });
    return plainToInstance(CategoryResponse, category);
  }
}
