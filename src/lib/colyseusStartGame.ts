import { Client } from "colyseus.js";

export async function startGame(client: Client) {
  try {
    const room = await client.joinOrCreate("game_room", { userId: "player1" });

    console.log("Joined room:", room.name);

    // Listen for broadcasted messages
    room.onMessage("turnPlayed", (message) => {
      console.log("Player sent turn:", message);
    });

    // Send a message to the server
    room.send("turn", {
      turnMoves: {
        x: 10,
        y: 20
      }
    });
  } catch (error) {
    console.error("Failed to join room:", error);
  }
}
