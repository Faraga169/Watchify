export interface Message {
  id: number;
  sender: 'user' | 'assistant';
  text: string;
}