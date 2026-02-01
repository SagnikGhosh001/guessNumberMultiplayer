const askName = async (conn) => {
  const encoder = new TextEncoder();
  await conn.write(encoder.encode("We Need Your Name...\n"));
  await conn.write(encoder.encode("Enter Your Name :- "));
  const buff = new Uint8Array(1024);
  const n = await conn.read(buff);
  if (n <= 2) {
    return await askName(conn);
  }

  return new TextDecoder().decode(buff.slice(0, n)).trim();
};

const handleConnections = async (clients, conn, name) => {
  if (clients.size < 2) {
    console.log("Minimum 2 player needed");
    return;
  }
};

export const startGame = async (listners) => {
  const encoder = new TextEncoder();
  const clients = new Set();

  for await (const conn of listners) {
    if (clients.size < 2) {
      const name = await askName(conn);
      await conn.write(encoder.encode("You are joined...\n"));
      Deno.stdout.write(encoder.encode(`Client Joined with name ${name}...\n`));
      clients.add(conn);
      handleConnections(clients, conn, name);
    } else {
      await conn.write(encoder.encode("maximum Player Joined...\n"));
      conn.close();
    }
  }
};
