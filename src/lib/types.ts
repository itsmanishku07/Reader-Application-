export interface BookSettings {
  fontSize: number;
  theme: 'light' | 'dark' | 'sepia' | 'indigo';
  animation: 'slide' | 'fade';
  fontFamily: 'serif' | 'sans' | 'mono';
}

export interface Book {
  id: string;
  userId: string;
  title: string;
  content: string;
  createdAt: Date;
  lastAccessed: Date;
  currentPage: number;
  settings: BookSettings;
}

export type BookUpdate = Partial<Pick<Book, 'currentPage' | 'settings' | 'content' | 'title'>>;
