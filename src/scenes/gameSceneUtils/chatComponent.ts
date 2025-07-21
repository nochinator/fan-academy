import { sendChatMessage } from "../../colyseus/colyseusGameRoom";
import GameScene from "../game.scene";

export function addChatComponent(context: GameScene): void {
  const chatComponent = document.getElementById('chatcomponent');
  chatComponent!.style.display = 'block';
  chatComponent!.style.position = 'absolute';
  chatComponent!.style.bottom = '20px';
  const chatMessages = document.getElementById('chatmessages');
  const chatInput = document.getElementById('chatinput') as HTMLInputElement;

  if (!chatComponent || !chatInput || !chatMessages) throw new Error('addChatComponent() component missing');

  chatInput.addEventListener('keydown', (keyPressed) => {
    if (keyPressed.key === 'Enter' && chatInput.value.trim()) {
      console.log("Message: ", chatInput.value);
      sendChatMessage(context.currentRoom, chatInput.value.trim());
      chatInput.value = '';
    }
  });
}