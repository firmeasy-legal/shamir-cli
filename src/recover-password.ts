import { z } from "zod";
import fs from "node:fs/promises";
import { join } from "shamir";
import { randomBytes } from 'node:crypto';

async function main([FIRST_KEY_PART_PATH, SECOND_KEY_PART_PATH]: [string, string]) {
	const firstBase64KeyPart = await Bun.file(FIRST_KEY_PART_PATH).text();
	const secondBase64KeyPart = await Bun.file(SECOND_KEY_PART_PATH).text();

	const firstKeyPart = globalThis.atob(firstBase64KeyPart);
	const secondKeyPart = globalThis.atob(secondBase64KeyPart);

	const firstKeyPartBytes = new Uint8Array(firstKeyPart.length);

	for (let i = 0; i < firstKeyPart.length; i++) {
		firstKeyPartBytes[i] = firstKeyPart.charCodeAt(i);
	}

	const secondKeyPartBytes = new Uint8Array(secondKeyPart.length);

	for (let i = 0; i < secondKeyPart.length; i++) {
		secondKeyPartBytes[i] = secondKeyPart.charCodeAt(i);
	}

	const recoveredPassword = join({
		"0": firstKeyPartBytes,
		"1": secondKeyPartBytes,
	});

	const utf8Decoder = new TextDecoder();
	const password = utf8Decoder.decode(recoveredPassword);

	console.log(password);
}

main(
	z.tuple([
		z
			.string()
			.min(1)
			.regex(/^[^\0]+$/, "Invalid pathname"),
		z
			.string()
			.min(1)
			.regex(/^[^\0]+$/, "Invalid pathname"),
	])
		.parse(process.argv.slice(2))
);