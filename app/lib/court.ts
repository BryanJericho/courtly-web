// types/court.d.ts atau di awal komponen
export interface Court {
  id: string | number; // Perubahan di sini
  name: string;
  location: string;
  price: string;
  rating: number;
  imageUrl: string;
  isFutsal?: boolean;
  isBasket?: boolean;
}

export interface FAQItemType {
  question: string;
  answer: string;
}
