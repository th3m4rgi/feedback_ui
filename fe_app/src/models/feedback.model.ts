// src/models/feedback.model.ts
export interface Feedback {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  feedback: string;
  rating: number;
  createdAt: Date | string;
}

// For API responses
export interface ApiResponse<T> {
  success: boolean;
  count?: number;
  data: T;
  message?: string;
}