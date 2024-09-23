import { combine } from "shamir-secret-sharing";
import { password } from "@inquirer/prompts";
import { z } from "zod";

async function main() {
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

	const utf8Decoder = new TextDecoder();
	const decodedPassword = utf8Decoder.decode(recovered);

	console.log(decodedPassword);
}

main();