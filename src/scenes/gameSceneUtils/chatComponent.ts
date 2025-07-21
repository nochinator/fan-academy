import { sendChatMessage } from "../../colyseus/colyseusGameRoom";
import { IChatMessage } from "../../interfaces/gameInterface";
import GameScene from "../game.scene";

export function renderChatMessage(chatMessage: IChatMessage): void {
  const chatMessagesDiv = document.getElementById('chatmessages');
  if (!chatMessagesDiv) return;

  const { username, message } = chatMessage;
  const msgElement = document.createElement('div');

  msgElement.innerHTML = `<span class="username">${username}</span>: <span class="message">${message}</span>`;
  const usernameSpan = msgElement.querySelector('.username') as HTMLElement;
  const messageSpan = msgElement.querySelector('.username') as HTMLElement;

  usernameSpan.style.color = '#f44336'; //#4fc3f7
  usernameSpan.style.fontWeight = 'bold';

  // msgElement.textContent = `${username}: ${message}`;
  chatMessagesDiv.appendChild(msgElement);
  chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight;
}

export function createChatComponent(context: GameScene): void {
  const chat = context.add.dom(633, 800).createFromCache('chatComponent').setOrigin(0.5) ;
  const chatRoot = chat.node as HTMLElement;
  chatRoot.style.pointerEvents = 'auto';

  const chatContainer = chat.getChildByID('chatcomponent') as HTMLElement;
  const chatInput = chat.getChildByID('chatinput') as HTMLInputElement;
  const chatMessages = chat.getChildByID('chatmessages') as HTMLElement;

  if (!chatInput || !chatMessages) return;

  // Get canvas size
  const width = context.scale.width;
  const height = context.scale.height;

  chatContainer.style.width = `${context.scale.width * 0.70}px`;
  chatContainer.style.height = `${context.scale.height * 0.17}px`;
  chatContainer.style.backgroundColor = '#111';
  chatContainer.style.borderRadius = '8px';
  chatContainer.style.padding = '8px';
  chatContainer.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
  chatContainer.style.display = 'flex';
  chatContainer.style.flexDirection = 'column';
  chatContainer.style.gap = '8px';

  chatMessages.style.flex = '1';
  chatMessages.style.overflowY = 'auto';
  chatMessages.style.overflowX = 'hidden';
  chatMessages.style.whiteSpace = 'pre-wrap';
  chatMessages.style.backgroundColor = '#222';
  chatMessages.style.color = '#fff';
  chatMessages.style.fontFamily = 'proLight';
  chatMessages.style.fontSize = '35px';
  chatMessages.style.padding = '6px';
  chatMessages.style.borderRadius = '4px';
  chatMessages.style.maxHeight = `${context.scale.height * 0.25}px`;
  chatMessages.style.touchAction = 'manipulation';

  chatInput.style.width = '98%';
  chatInput.style.padding = '6px';
  chatInput.style.border = 'none';
  chatInput.style.borderRadius = '4px';
  chatInput.style.fontSize = '25px';
  chatInput.style.fontFamily = 'proLight';

  // Optionally apply responsive height to inner elements too
  const messagesDiv = chat.getChildByID('chatmessages') as HTMLElement;
  messagesDiv.style.maxHeight = `${height * 0.25}px`;

  chatInput.addEventListener('keydown', (keyPressed) => {
    if (keyPressed.key === 'Enter' && chatInput.value.trim()) {
      console.log("Message: ", chatInput.value);
      sendChatMessage(context.currentRoom, chatInput.value.trim());
      chatInput.value = '';
    }
  });

  // Render the messages
  const messagesToRender = context.currentGame.chatLogs.messages;
  if (!messagesToRender.length) return;

  messagesToRender.forEach((message) => renderChatMessage(message));
  chatMessages.scrollTop = chatMessages.scrollHeight;
}