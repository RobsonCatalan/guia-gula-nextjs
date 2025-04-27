/// <reference types="jest" />
/* eslint-env jest */
import { slugify } from '@/lib/utils';

describe('slugify', () => {
  it('converts string to lowercase, removes accents, and replaces spaces with hyphens', () => {
    expect(slugify('Café da manhã')).toBe('cafe-da-manha');
    expect(slugify('Hello World!')).toBe('hello-world');
    expect(slugify('---Hello---')).toBe('hello');
    expect(slugify('Multiple   spaces')).toBe('multiple-spaces');
    expect(slugify('Accents áéíóú')).toBe('accents-aeiou');
  });
});
