import * as fs from 'fs';
import * as path from 'path';

export class Utils {

    public static toHexString(buffer: Buffer): string {
        const s: string = buffer.toString('hex');

        return [...s]
            .map((c: string, i: number) => i)
            .filter((i: number) => i % 2 === 0)
            .map((i: number) => `${s[i]}${s[i + 1]}`)
            .join(' ');
    }

    public static async sleep(duration: number): Promise<void> {
        return new Promise<void>((resolve) => setTimeout(() => resolve(), duration));
    }

    public static getHeader(currentPath: string): string {
        return fs.readFileSync([currentPath, 'assets', 'banner.txt']
            .join(path.sep)).toString()
            .replace('{{VERSION_STRING_GOES_HERE}}', `Version ${fs.readFileSync([currentPath, 'assets', 'version.txt']
                .join(path.sep)).toString().trim()}`
                .padStart(28));
    }

}
