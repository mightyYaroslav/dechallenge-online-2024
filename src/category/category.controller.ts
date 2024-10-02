import { ApiOkResponse, ApiProperty, ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { Expose, plainToInstance } from 'class-transformer';
import { IsArray, IsString } from 'class-validator';

class CategoryResponse {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  title: string;

  @ApiProperty({ type: [String] })
  @Expose()
  points: string[];
}

class CategoryInput {
  @IsString()
  @ApiProperty()
  title: string;

  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ type: [String] })
  points: string[];
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

  @Put(':id')
  @ApiOkResponse({ type: CategoryResponse })
  async updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() input: CategoryInput,
  ): Promise<CategoryResponse> {
    const category = await this.categoryService.updateCategory({ id }, input);
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
