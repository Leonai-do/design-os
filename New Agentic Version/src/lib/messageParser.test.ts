import { describe, it, expect } from 'vitest';
import { parseMessage } from './messageParser';

describe('messageParser', () => {
  it('parses simple text', () => {
    const input = 'Hello world';
    const result = parseMessage(input);
    expect(result).toEqual([{ type: 'text', content: 'Hello world' }]);
  });

  it('parses complete thinking block', () => {
    const input = '<think>Analysis</think>The result';
    const result = parseMessage(input);
    expect(result).toEqual([
      { type: 'think', content: 'Analysis', isComplete: true },
      { type: 'text', content: 'The result' }
    ]);
  });

  it('parses thinking block in the middle', () => {
    const input = 'Start <think>Middle</think> End';
    const result = parseMessage(input);
    expect(result).toEqual([
      { type: 'text', content: 'Start ' },
      { type: 'think', content: 'Middle', isComplete: true },
      { type: 'text', content: ' End' }
    ]);
  });

  it('parses streaming unclosed think block', () => {
    const input = '<think>Thinking...';
    const result = parseMessage(input);
    expect(result).toEqual([
      { type: 'think', content: 'Thinking...', isComplete: false }
    ]);
  });

  it('parses text then unclosed think block (streaming)', () => {
    const input = 'Wait <think>Thinking...';
    const result = parseMessage(input);
    expect(result).toEqual([
      { type: 'text', content: 'Wait ' },
      { type: 'think', content: 'Thinking...', isComplete: false }
    ]);
  });

  it('parses multiline think block', () => {
    const input = '<think>\nLine 1\nLine 2\n</think>Done';
    const result = parseMessage(input);
    expect(result).toEqual([
      { type: 'think', content: '\nLine 1\nLine 2\n', isComplete: true },
      { type: 'text', content: 'Done' }
    ]);
  });
});
