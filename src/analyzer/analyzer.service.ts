import { Injectable } from '@nestjs/common';
import { CallService } from 'src/call/call.service';
import whisper from 'whisper-node';
import * as fs from 'fs';

@Injectable()
export class AnalyzerService {
  constructor(private readonly callService: CallService) {}

  async analyze(callId: number): Promise<void> {
    const call = await this.callService.getCall({ id: callId });
    console.log(__dirname);
    const f = fs.readFileSync(call.audioUrl);
    console.log(f.slice(0, 100));
    const transcript = await whisper(call.audioUrl);
    console.log(transcript); // output: [ {start,end,speech} ]
  }
}
