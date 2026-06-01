import { Component, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { SupportService } from '../../services/support.service';
import { ChatbotHistoryItem } from '../../models/chatbot.model';

@Component({
  selector: 'app-ai-chatbot',
  templateUrl: './ai-chatbot.component.html',
  styleUrls: ['./ai-chatbot.component.css']
})
export class AIChatbotComponent implements AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  isOpen = false;
  isTyping = false;
  newMessage = '';
  
  messages: { sender: 'user' | 'bot', content: string, timestamp: Date }[] = [
    { sender: 'bot', content: 'Hello! I am your AI Support Assistant. How can I help you today?', timestamp: new Date() }
  ];
  
  history: ChatbotHistoryItem[] = [];
  suggestedAction?: string;
  unreadCount = 0;

  constructor(private supportService: SupportService) {}

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.unreadCount = 0;
      setTimeout(() => this.scrollToBottom(), 100);
    }
  }

  clearHistory() {
    this.messages = [
      { sender: 'bot', content: 'Chat history cleared. How can I help you?', timestamp: new Date() }
    ];
    this.history = [];
    this.suggestedAction = undefined;
  }

  sendPrompt(prompt: string) {
    this.newMessage = prompt;
    this.sendMessage();
  }

  sendMessage() {
    if (!this.newMessage.trim() || this.isTyping) return;

    const userText = this.newMessage.trim();
    this.messages.push({ sender: 'user', content: userText, timestamp: new Date() });
    this.newMessage = '';
    this.isTyping = true;
    this.suggestedAction = undefined;

    this.scrollToBottom();

    this.supportService.askChatbot(userText, this.history).subscribe({
      next: (res) => {
        this.messages.push({ sender: 'bot', content: res.response, timestamp: new Date() });
        
        // Append to local history for future calls
        this.history.push({ role: 'user', content: userText });
        this.history.push({ role: 'assistant', content: res.response });

        if (res.ticketSuggest) {
          this.suggestedAction = 'OPEN_TICKET';
        } else {
          this.suggestedAction = undefined;
        }

        this.isTyping = false;
        if (!this.isOpen) this.unreadCount++;
      },
      error: () => {
        this.messages.push({ sender: 'bot', content: 'Sorry, I am having trouble connecting to the server. Please try again later.', timestamp: new Date() });
        this.isTyping = false;
        if (!this.isOpen) this.unreadCount++;
      }
    });
  }

  private scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
      }
    } catch(err) {}
  }
}
