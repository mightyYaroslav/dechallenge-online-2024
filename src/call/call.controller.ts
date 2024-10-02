import { ApiOkResponse, ApiProperty, ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { IsString } from 'class-validator';
import { CallService } from './call.service';
import { AnalyzerService } from 'src/analyzer/analyzer.service';
import { GraphileRunner } from 'src/runner';

class CallResponse {
  @IsString()
  @ApiProperty()
  id: string;

  @IsString()
  @ApiProperty()
  name: string;

  @IsString()
  @ApiProperty()
  location: string;

  @IsString()
  @ApiProperty()
  emotionalTone: string;

  @IsString()
  @ApiProperty()
  text: string;

  @IsString()
  @ApiProperty()
  categories: string;
}

class CallInput {
  @IsString()
  @ApiProperty()
  audioUrl: string;
}

@ApiTags('Calls API')
@Controller('call')
export class CallController {
  constructor(
    private readonly callService: CallService,
    private readonly runner: GraphileRunner,
    private readonly analyzer: AnalyzerService,
  ) {}

  @Get(':id')
  @ApiOkResponse({ type: CallResponse, isArray: true })
  async getCall(@Param('id', ParseIntPipe) id: number): Promise<CallResponse> {
    const call = await this.callService.getCall({ id });
    return plainToInstance(CallResponse, call);
  }

  @Post()
  @ApiOkResponse({ type: CallResponse })
  async createCall(@Body() input: CallInput): Promise<CallResponse> {
    const call = await this.callService.createCall(input);
    await this.runner.addJob({
      jobId: 'process_call',
      payload: { callId: call.id },
      handler: ({ callId }) => this.analyzer.analyze(callId),
    });
    return plainToInstance(CallResponse, call);
  }
}
