export interface User {
  id: string
  name: string | null
  email: string | null
  image: string | null
}

export interface Dog {
  id: string
  name: string
  breed: string
  age: number
  weight: number
  ownerId: string
  createdAt: Date
  updatedAt: Date
  vaccinated: boolean
  neutered: boolean
  friendly: boolean
  notes: string | null
}

export interface Sitter {
  id: string
  userId: string
  user: User
  bio: string | null
  address: string
  city: string
  state: string
  zipCode: string
  rate: number
  capacity: number
  createdAt: Date
  updatedAt: Date
}

export interface Review {
  id: string
  rating: number
  comment: string
  bookingId: string
  createdAt: Date
}

export interface Booking {
  id: string
  clientId: string
  sitterId: string
  startDate: Date
  endDate: Date
  status: BookingStatus
  totalPrice: number | null
  dogs: Dog[]
  sitter: Sitter
  client: {
    name: string | null
    image: string | null
  }
  review: Review | null
}

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' 