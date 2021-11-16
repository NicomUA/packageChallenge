import { Packer } from './packer';
import * as path from 'path';

describe('[Unit] Packer', () => {
  let packer: Packer;

  beforeEach(() => {
    packer = new Packer();
  });

  it('Packer class should be initiated', () => {
    expect(packer).toBeDefined();
    expect(packer).toBeInstanceOf(Packer);
  });

  it('Packer class should have static method pack', () => {
    expect(Packer.pack).toBeDefined();
    expect(typeof Packer.pack).toBe('function');
  });

  it('Packer class should throw if filepath is empty', () => {
    expect(() => Packer.pack('')).toThrowError('File path in empty');
  });

  it('Packer class should throw if file does not exist', () => {
    expect(() => Packer.pack('wrong_file_path')).toThrowError(
      `File doesn't exist`,
    );
  });

  it('Packer class should throw if file format is wrong', () => {
    expect(() =>
      Packer.pack(
        path.resolve(__dirname, '../resources', 'example_input_wrong'),
      ),
    ).toThrowError(/Line(.*)incorrect/);
  });

  it('Packer class should throw if input file have wrong format', () => {
    expect(() => Packer.parse('str: (str)m')).toThrowError(/Line(.*)incorrect/);
  });

  it('Packer class should throw if max wight is > 100', () => {
    expect(() => Packer.parse('200 : (1,15.3,€34)')).toThrowError(
      'Target package weight should not be more than 100',
    );
  });

  it('Packer class should throw if item wight is > 100', () => {
    expect(() => Packer.parse('100 : (1,115.3,€34)')).toThrowError(
      'Item weight should not be more than 100',
    );
  });

  it('Packer class should throw if item cost is > 100', () => {
    expect(() => Packer.parse('100 : (1,15.3,€134)')).toThrowError(
      'Item cost should not be more than 100',
    );
  });

  it('Packer class should throw if items > 15', () => {
    expect(() =>
      Packer.parse(
        '75 : (1) (2) (3) (4) (5) (6) (7) (8) (9) (10) (11) (12) (13) (14) (15) (16)',
      ),
    ).toThrowError('Items in line should not be more than 15');
  });

  it('Packer class should parse file and return result for file', () => {
    const result = Packer.pack(
      path.resolve(__dirname, '../resources', 'example_input'),
    );
    expect(typeof result).toBe('string');
  });

  it('Packer class should return correct result', () => {
    const result = Packer.pack(
      path.resolve(__dirname, '../resources', 'example_input'),
    );
    expect(result).toBe(`4\n-\n2,7\n9,8`);
  });

  it('Packer class should parse large file and return result for file', () => {
    const result = Packer.pack(
      path.resolve(__dirname, '../resources', 'example_input_large'),
    );
    expect(typeof result).toBe('string');
  });

  it('Packer should return combination with lower weight if cost equal', () => {
    const items = Packer.parse(
      '81 : (1,53.38,€45) (2,88.62,€98) (3,78.48,€3) (4,72.30,€76) (5,30.18,€9) (6,46.34,€48) (7,70.30,€76)',
    );

    expect(Packer.calculate(items)).toBe('7');
  });
});
