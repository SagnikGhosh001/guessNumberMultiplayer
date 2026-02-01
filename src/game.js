const handleConnections = (clients, conn) => {
  if (clients.size < 2) {
    console.log("Minimum 2 player needed");
  }
};

export const startGame = async (listners) => {
  const clients = new Set();

  for await (const conn of listners) {
    clients.add(conn);
    handleConnections(clients, conn);
  }
};
