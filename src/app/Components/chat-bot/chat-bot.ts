import { Component, EventEmitter, inject, Output, signal } from '@angular/core';
import { Message } from '../../Core/Interfaces/IMessage';
import { FormsModule } from '@angular/forms';
import { Recommendation } from '../../Core/Services/recommendation';
@Component({
  selector: 'app-chat-bot',
  imports: [FormsModule],
  templateUrl: './chat-bot.html',
  styleUrl: './chat-bot.css',
})
export class ChatBot {
  inputText = '';
  recommendationService = inject(Recommendation);
  messages = signal<Message[]>([]);
  @Output() moviesIdsEmitter = new EventEmitter<number[]>();

  private constructAssistanceMessage(rec:any[]) : Message {
    return {id: Date.now() + 1 , sender:'assistant' , text : rec.map(r => `${r.title}\n${r.genres}`).join('\n')};
  }
  sendMessage(): void {
    if (!this.inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      sender: 'user',
      text: this.inputText
    };

    this.messages.update(msgs => {
      return [...msgs , userMessage]
    });
    setTimeout(async () => {
      var list = this.messages().map((msg) : { role: string; content: string } => ({
        role: msg.sender,
        content: msg.text
      }));
      var recommendations = await this.recommendationService.recommend(list);
      this.messages.update(msgs => {
        return [...msgs , this.constructAssistanceMessage(recommendations)]
      })
      console.log(recommendations.map(r => parseInt(r.id)));
      this.moviesIdsEmitter.emit(recommendations.map(r => parseInt(r.id)));
    }, 500);
    this.inputText = '';
  }
}
