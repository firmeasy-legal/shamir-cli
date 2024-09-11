import { z } from "zod";
import { join } from "shamir";

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

	const recovered = join({
		"1": firstKeyPartBytes,
		"2": secondKeyPartBytes,
	});

	const utf8Decoder = new TextDecoder();
	const password = utf8Decoder.decode(recovered);

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