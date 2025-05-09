 'use client'

import { useEffect, useState, useMemo, Suspense } from 'react'
import { Box, Button, VStack, Text, useToast } from '@chakra-ui/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { FcGoogle } from 'react-icons/fc'
import { signInWithGoogle } from '@/utils/auth'
import { auth } from '@/utils/firebase'
import { onAuthStateChanged } from 'firebase/auth'

function SignInComponent() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const toast = useToast()

  // Use useMemo to ensure searchParams doesn't cause unnecessary re-renders
  const redirect = useMemo(() => searchParams.get('redirect') || '/dashboard', [searchParams])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push(redirect)
      }
    })

    return () => unsubscribe()
  }, [router, redirect])

  const handleGoogleSignIn = async () => {
    setLoading(true)
    try {
      await signInWithGoogle()
      // The onAuthStateChanged listener will handle the redirect
    } catch (error) {
      console.error('Error signing in with Google:', error)
      toast({
        title: 'Error signing in',
        description: 'An error occurred while signing in. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box maxWidth="400px" margin="auto" mt={8}>
      <VStack spacing={4}>
        <Text fontSize="xl" fontWeight="bold">Sign In to DebateBrawl</Text>
        <Button
          leftIcon={<FcGoogle />}
          onClick={handleGoogleSignIn}
          isLoading={loading}
          loadingText="Signing In"
          width="full"
        >
          Sign in with Google
        </Button>
      </VStack>
    </Box>
  )
}

// Wrap in Suspense for safe hydration
export default function SignIn() {
  return (
    <Suspense fallback={<Text>Loading...</Text>}>
      <SignInComponent />
    </Suspense>
  )
}
