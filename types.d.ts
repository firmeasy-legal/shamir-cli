declare module "shamir" {
	export function split(randomBytes: (length: number) => Uint8Array, parts: number, quorum: number, secret: Uint8Array): Record<number, Uint8Array>;
	export function join(parts: Record<number, Uint8Array>): Uint8Array;
}