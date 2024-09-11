import { z } from "zod";
import fs from "node:fs/promises";
import { split } from "shamir";
import { randomBytes } from 'node:crypto';

const schema = z
	.string()
	.min(1)
	.regex(/^[^\0]+$/, "Invalid directory path");

async function main(args: string[]) {
	const [KEY_PARTS_DIR] = args

	const keyPartsDir = await schema.parseAsync(KEY_PARTS_DIR);

	await fs.mkdir(keyPartsDir, { recursive: true });

	const PARTS = 3;
	const QUORUM = 2;

	const utf8Encoder = new TextEncoder();
	const randomPassword = Math.random().toString(36).slice(2);
	const passwordBytes = utf8Encoder.encode(randomPassword);

	const asciiKeyParts = Object.values(split(randomBytes, PARTS, QUORUM, passwordBytes))

	let keyPartIndex = 1;
	for (const asciiKeyPart of asciiKeyParts) {
		const keyPart = Array
			.from(asciiKeyPart)
			.map((byte) => String.fromCharCode(byte))
			.join('')

		const base64KeyPart = globalThis.btoa(keyPart);

		await fs.writeFile(`${keyPartsDir}/key-${keyPartIndex.toString().padStart(2, "0")}.share`, base64KeyPart);

		keyPartIndex++;
	}
}

main(process.argv.slice(2));