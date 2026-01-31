export interface PointsAllocationTable {
  Row: {
    id: string
    created_at: string
    type: string
    percentage: number
    description: string
    is_active: boolean
  }
  Insert: {
    id?: string
    created_at?: string
    type: string
    percentage: number
    description: string
    is_active?: boolean
  }
  Update: {
    id?: string
    created_at?: string
    type?: string
    percentage?: number
    description?: string
    is_active?: boolean
  }
}