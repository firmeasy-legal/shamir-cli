import { z } from "zod";
import { split } from "shamir-secret-sharing";
import fs from "node:fs/promises";

async function main([base64Password, keyPartsDir]: [string, string] | [string]) {
	if (keyPartsDir) {
		await fs.mkdir(keyPartsDir, { recursive: true });
	}

	const PARTS = 3;
	const QUORUM = 2;

	const utf8Encoder = new TextEncoder();

	const passwordBytes = utf8Encoder.encode(base64Password);

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

main(
	z.union([
		z.tuple([
			z
				.string()
				.min(1)
				.base64()
		]),
		z.tuple([
			z
				.string()
				.min(1)
				.base64(),
			z
				.string()
				.min(1)
				.regex(/^[^\0]+$/, "Invalid directory path")
		])
	])
		.parse(process.argv.slice(2))
);