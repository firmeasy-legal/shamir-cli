import { z } from "zod";
import fs from "node:fs/promises";
import { split } from "shamir-secret-sharing";
import crypto from 'node:crypto';

async function main([keyPartsDir]: [string | null]) {
	if (keyPartsDir) {
		await fs.mkdir(keyPartsDir, { recursive: true });
	}

	const PARTS = 3;
	const QUORUM = 2;

	const utf8Encoder = new TextEncoder();

	const randomBytes = crypto.randomBytes(6);
	const randomPassword = randomBytes.toString('base64');

	const passwordBytes = utf8Encoder.encode(randomPassword);

	const shares = await split(passwordBytes, PARTS, QUORUM)

	let keyPartIndex = 1;
	for (const share of shares) {
		const keyPart = Array
			.from(share)
			.map((byte) => String.fromCharCode(byte))
			.join('')

		const base64KeyPart = globalThis.btoa(keyPart);

		if (keyPartsDir) {
			await fs.writeFile(`${keyPartsDir}/key-${keyPartIndex.toString().padStart(2, "0")}.share`, base64KeyPart);
		} else {
			console.log(base64KeyPart);
		}

		keyPartIndex++;
	}
}

const realArgs = process.argv.slice(2);

const args = realArgs.length === 0 ? [null] : realArgs;

main(
	z.tuple([
		z
			.string()
			.min(1)
			.regex(/^[^\0]+$/, "Invalid directory path")
			.nullable()
	])
		.parse(args)
);