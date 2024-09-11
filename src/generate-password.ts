import { z } from "zod";
import fs from "node:fs/promises";
import { split } from "shamir";
import { randomBytes } from 'node:crypto';

async function main([KEY_PARTS_DIR]: string[]) {
	await fs.mkdir(KEY_PARTS_DIR, { recursive: true });

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

		await fs.writeFile(`${KEY_PARTS_DIR}/key-${keyPartIndex.toString().padStart(2, "0")}.share`, base64KeyPart);

		keyPartIndex++;
	}
}

main(
	z.tuple([
		z
			.string()
			.min(1)
			.regex(/^[^\0]+$/, "Invalid directory path")
	])
		.parse(process.argv.slice(2))
);