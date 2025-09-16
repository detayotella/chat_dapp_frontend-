import { useWriteContract, useReadContract, useWatchContractEvent, useAccount } from 'wagmi'
import { ChatRegistryConfig } from '../contracts/ChatRegistry'

export function useChatRegistry(username) {
  const { address } = useAccount()
  
  const { writeContract, data: hash, isPending } = useWriteContract()

  const register = async (args) => {
    const { request } = await writeContract({
      ...ChatRegistryConfig,
      functionName: 'register',
      args: args
    })
    return request
  }

  useWatchContractEvent({
    ...ChatRegistryConfig,
    eventName: 'UserRegistered',
  })

  const { data: profile, isLoading: isLoadingProfile } = useReadContract({
    ...ChatRegistryConfig,
    functionName: 'getProfile',
    args: [address],
  })

  const { data: isRegistered } = useReadContract({
    ...ChatRegistryConfig,
    functionName: 'isRegistered',
    args: [address],
  })

  const { data: resolvedAddress, isLoading: isResolvingUsername } = useReadContract({
    ...ChatRegistryConfig,
    functionName: 'resolveUsername',
    args: [username],
  })

  return {
    register,
    isRegistering: isPending,
    profile,
    isLoadingProfile,
    isRegistered,
    resolveUsername: (username) => {
      return resolvedAddress === '0x0000000000000000000000000000000000000000'
    },
    isResolvingUsername,
    hash
  }
}