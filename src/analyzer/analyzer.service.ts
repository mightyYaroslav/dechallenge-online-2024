import { Injectable } from '@nestjs/common';
import { CallService } from 'src/call/call.service';
const cwd = process.cwd();
import whisper from 'whisper-node';
import * as path from 'path';
import * as tf from '@tensorflow/tfjs';
import * as fs from 'fs';

@Injectable()
export class AnalyzerService {
  private readonly OOV_INDEX = 2;
  private readonly PAD_INDEX = 0;

  constructor(private readonly callService: CallService) {}

  private getSentimentValue(score: number): string {
    if (score > 0.7) {
      return 'Positive';
    } else if (score > 0.4) {
      return 'Neutral';
    } else if (score > 0.1) {
      return 'Negative';
    } else {
      return 'Angry';
    }
  }

  private padSequences(
    sequences: any[],
    maxLen,
    padding = 'pre',
    truncating = 'pre',
    value = this.PAD_INDEX,
  ) {
    return sequences.map((seq) => {
      if (seq.length > maxLen) {
        if (truncating === 'pre') {
          seq.splice(0, seq.length - maxLen);
        } else {
          seq.splice(maxLen, seq.length - maxLen);
        }
      }

      if (seq.length < maxLen) {
        const pad = [];
        for (let i = 0; i < maxLen - seq.length; ++i) {
          pad.push(value);
        }
        if (padding === 'pre') {
          seq = pad.concat(seq);
        } else {
          seq = seq.concat(pad);
        }
      }

      return seq;
    });
  }

  private getSentimentScore(
    model: tf.LayersModel,
    metadata: any,
    text: string,
  ): number {
    const inputText = text
      .trim()
      .toLowerCase()
      .replace(/(\.|\,|\!)/g, '')
      .split(' ');
    const sequence = inputText.map((word) => {
      let wordIndex = metadata.word_index[word] + metadata.index_from;
      if (wordIndex > metadata.vocabulary_size) {
        wordIndex = this.OOV_INDEX;
      }
      return wordIndex;
    });
    const paddedSequence = this.padSequences([sequence], metadata.max_len);
    const input = tf.tensor2d(paddedSequence, [1, metadata.max_len]);

    const predictOut = model.predict(input);
    const score = [predictOut].flat().map((t) => t.dataSync()[0]);
    [predictOut].flat().map((t) => t.dispose());

    return score[0];
  }

  async analyze(callId: number): Promise<void> {
    const call = await this.callService.getCall({ id: callId });
    const p = path.join(cwd, call.audioUrl);
    const transcript = await whisper(p);
    const text = transcript.map((t) => t.speech).join(' ');

    console.log('file://' + path.join(cwd, 'model.json'));
    const model = await tf.loadLayersModel(
      'file://' + path.join(cwd, 'model.json'),
    );
    const metadata = JSON.parse(
      fs.readFileSync('file://' + path.join(cwd, 'metadata.json')).toString(),
    );

    const score = this.getSentimentScore(model, metadata, text);

    await this.callService.updateCall(
      {
        id: callId,
      },
      { text: text, emotionalTone: this.getSentimentValue(score) },
    );
  }
}
