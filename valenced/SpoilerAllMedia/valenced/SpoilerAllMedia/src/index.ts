import { findByProps, findByStoreName } from "@vendetta/metro";
import { after } from "@vendetta/patcher";
import { FluxDispatcher } from "@vendetta/metro/common";

const patches: Array<() => void> = [];

function getUploadStore() {
    return (
        findByStoreName?.("UploadAttachmentStore") ??
        findByProps?.("getUploads", "getUpload") ??
        null
    );
}

export function toggleAllSpoilers(channelId: string, draftType = 0): boolean {
    const UploadAttachmentStore = getUploadStore();
    if (!UploadAttachmentStore || !channelId) return false;

    const uploads = UploadAttachmentStore.getUploads?.(channelId, draftType);
    if (!Array.isArray(uploads) || uploads.length === 0) return false;

    const allSpoiled = uploads.every((u: any) => Boolean(u?.spoiler));
    const targetState = !allSpoiled;

    for (const upload of uploads) {
        if (upload && typeof upload === "object") {
            upload.spoiler = targetState;
        }
    }

    FluxDispatcher.dispatch?.({
        type: "UPLOAD_ATTACHMENT_SET_UPLOADS",
        channelId,
        uploads: [...uploads],
        draftType
    });

    return targetState;
}

export default {
    onLoad() {
        // Wpinanie przycisku w UI paska czatu / załączników pod Twoją wersję Valenced
    },

    onUnload() {
        while (patches.length > 0) {
            const unpatch = patches.pop();
            unpatch?.();
        }
    }
};
