export class IsbnGenerator {
  static generate(): string {
    const prefix = '978'; // Common ISBN-13 prefix
    let randomDigits = '';

    for (let i = 0; i < 9; i++) {
      randomDigits += Math.floor(Math.random() * 10);
    }

    const partialIsbn = prefix + randomDigits;
    const checksum = this.calculateChecksum(partialIsbn);

    return `${partialIsbn}${checksum}`;
  }

  private static calculateChecksum(isbnWithoutChecksum: string): number {
    const digits = isbnWithoutChecksum.split('').map(Number);
    const sum = digits.reduce(
      (acc, digit, idx) => acc + digit * (idx % 2 === 0 ? 1 : 3),
      0,
    );

    const remainder = sum % 10;
    return remainder === 0 ? 0 : 10 - remainder;
  }
}
