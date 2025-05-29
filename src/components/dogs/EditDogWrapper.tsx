'use client'

import { useRouter } from 'next/navigation'
import EditDogForm from './EditDogForm'
import type { Dog } from '@/types'

interface Props {
  dog: Dog
}

export default function EditDogWrapper({ dog }: Props) {
  const router = useRouter()

  return (
    <EditDogForm 
      dog={dog} 
      onCancel={() => router.push(`/dashboard/client/dogs/${dog.id}`)} 
    />
  )
} 