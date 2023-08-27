import { settings } from './settings'

export async function getImageUrls(studyId) {
    const response = await fetch(`${settings.storageUrl}/storage/${studyId}`);
    const fileNames = await response.json();
    return fileNames.map(fileName => `${settings.storageUrl}/storage/${studyId}/${fileName}`);
}
