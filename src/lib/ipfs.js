import { create } from 'ipfs-http-client'
import { IPFS_CONFIG, getAuthHeader } from '../config/ipfs'

const client = create({
  ...IPFS_CONFIG,
  headers: {
    authorization: getAuthHeader()
  }
})

// Upload file to IPFS
export const uploadToIPFS = async (file) => {
  try {
    const added = await client.add(file)
    return added.path
  } catch (error) {
    console.error('Error uploading to IPFS:', error)
    throw new Error('Failed to upload image to IPFS')
  }
}

// Get IPFS URL for displaying images
export const getIPFSUrl = (path) => {
  return `https://ipfs.io/ipfs/${path}`
}