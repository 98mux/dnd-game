import { registerPlugin } from '@capacitor/core';
export type AIResult = { className: string; similarity: number };

export type PhotoMetadataJSON = {
	identifier: string;
	creationDate: string; // ISO 8601
	location:
		| {
				latitude: number;
				longitude: number;
		  }
		| {}; // empty object if location is nil
	pixelWidth: number;
	pixelHeight: number;
	mediaType: number; // PHAssetMediaType raw value: 0 = unknown, 1 = image, 2 = video, etc.
};

export type ImageAnalyseResult = {
	result: AIResult[];
	metadata: PhotoMetadataJSON;
};
export interface BridgePlugin {
	echo(options: { path: string }): Promise<{ result: AIResult[] }>;
	prompts(options: { prompts: string[] }): Promise<void>;
	images(options: { imagePaths: string[] }): Promise<{ results: { [path: string]: AIResult[] } }>;
	images2(options: {
		batchSize: number;
		offset: number;
	}): Promise<{ results: Array<ImageAnalyseResult> }>;
	getTotalImages(options: {}): Promise<{ total: number }>;
	deletePhotos(options: { identifiers: string[] }): Promise<{ success: boolean }>;
	getThumbnails(options: {
		identifiers: string[];
	}): Promise<{ results: { identifier: string; base64: string; width: number; height: number }[] }>;
	photoAccess(options: {}): Promise<{
		result: { authorizationStatus: number; isLimited: boolean; photoCount: number };
	}>;
	pickImages(options: {}): Promise<{
		identifiers: string[];
	}>;
	deleteImageCache(options: {}): Promise<{ message: string; deletedCount: number }>;
}

const Bridge = registerPlugin<BridgePlugin>('Bridge');

export default Bridge;
