export const fileToBlob = async (file: File) => {
	return new Blob([new Uint8Array(await file.arrayBuffer())], { type: file.type })
}
