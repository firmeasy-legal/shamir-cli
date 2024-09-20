import { z } from "zod";
import { combine } from "shamir-secret-sharing";
import { input } from "@inquirer/prompts";

async function main() {
	const KeyPartSchema = z.string().min(1).base64();

	const firstBase64KeyPart = await input({
		message: 'Enter one key part: ',
		validate: (input) => {
			const validation = KeyPartSchema.safeParse(input);

			if (validation.success) {
				return true;
			}

			return validation.error.issues[0].message;
		}
	});

	const askSecondKeyPart = () => input({
		message: 'Enter another key part: ',
		validate: (input) => {
			const validation = KeyPartSchema
				.length(firstBase64KeyPart.length)
				.safeParse(input);

			if (validation.success) {
				return true;
			}

			return validation.error.issues[0].message;
		}
	});

	let secondBase64KeyPart = await askSecondKeyPart();

	while (secondBase64KeyPart === firstBase64KeyPart) {
		console.error('The second key part must be different from the first one');
		secondBase64KeyPart = await askSecondKeyPart();
	}

	const firstKeyPart = globalThis.atob(firstBase64KeyPart);
	const secondKeyPart = globalThis.atob(secondBase64KeyPart);

	const firstKeyPartBytes = new Uint8Array(firstKeyPart.split('').map(char => char.charCodeAt(0)));
	const secondKeyPartBytes = new Uint8Array(secondKeyPart.split('').map(char => char.charCodeAt(0)));

	const recovered = await combine([
		firstKeyPartBytes,
		secondKeyPartBytes,
	]);

	const utf8Decoder = new TextDecoder();
	const password = utf8Decoder.decode(recovered);

	console.log(password);
}

main();