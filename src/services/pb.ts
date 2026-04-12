import PocketBase from 'pocketbase'

const pb = new PocketBase(
  import.meta.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090',
)

/**
 * Build a PocketBase file URL manually.
 * Zod-parsed records lack collectionId, so pb.files.getUrl() doesn't work.
 */
export function getFileUrl(collection: string, recordId: string, filename: string): string {
  return `${pb.baseUrl}/api/files/${collection}/${recordId}/${filename}`
}

export default pb
