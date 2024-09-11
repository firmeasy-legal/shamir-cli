declare module "shamir" {
	export function split(randomBytes: (length: number) => Uint8Array, parts: number, quorum: number, secret: Uint8Array): Record<string, Uint8Array>;
	export function join(parts: Record<string, Uint8Array>): Uint8Array;
}