export const IPFS_CONFIG = {
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https'
}

export const getAuthHeader = () => {
  const projectId = import.meta.env.VITE_INFURA_IPFS_PROJECT_ID
  const projectSecret = import.meta.env.VITE_INFURA_IPFS_PROJECT_SECRET
  return `Basic ${btoa(`${projectId}:${projectSecret}`)}`
}