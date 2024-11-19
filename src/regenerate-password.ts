import { combine, split } from "shamir-secret-sharing";

import fs from "node:fs/promises";
import { password } from "@inquirer/prompts";
import { z } from "zod";

async function main([keyPartsDir]: [string | null]) {
	if (keyPartsDir) {
		await fs.mkdir(keyPartsDir, { recursive: true });
	}

	const KeyPartSchema = z.string().min(1).base64();

	const firstBase64KeyPart = await password({
		message: 'Enter one key part: ',
		mask: true,
		validate: (input) => {
			const validation = KeyPartSchema.safeParse(input);

			if (validation.success) {
				return true;
			}

			return validation.error.issues[0].message;
		}
	});

	const secondBase64KeyPart = await password({
		message: 'Enter another key part: ',
		mask: true,
		validate: (input) => {
			if (input === firstBase64KeyPart) {
				return "The second key part must be different from the first one.";
			}

			const validation = KeyPartSchema
				.length(firstBase64KeyPart.length)
				.safeParse(input);

			if (validation.success) {
				return true;
			}

			return validation.error.issues[0].message;
		}
	});

	const firstKeyPart = globalThis.atob(firstBase64KeyPart);
	const secondKeyPart = globalThis.atob(secondBase64KeyPart);

	const firstKeyPartBytes = new Uint8Array(firstKeyPart.split('').map(char => char.charCodeAt(0)));
	const secondKeyPartBytes = new Uint8Array(secondKeyPart.split('').map(char => char.charCodeAt(0)));

	const recovered = await combine([
		firstKeyPartBytes,
		secondKeyPartBytes,
	]);

	const PARTS = 3;
	const QUORUM = 2;

	const shares = await split(recovered, PARTS, QUORUM)

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