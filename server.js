import { startGame } from "./src/game.js";

const listner = Deno.listen({
  port: 8000,
});

await startGame(listner);
