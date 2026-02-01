const generateRandomNumber = () => Math.floor(Math.random() * 100);

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

const registerPlayer = async (conn) => {
  const name = await askName(conn);
  return { name, connection: conn };
};

const askNnumber = async (conn) => {
  const encoder = new TextEncoder();
  await conn.write(encoder.encode("Choose a number :- "));
  const buff = new Uint8Array(1024);
  const n = await conn.read(buff);
  const decodedNumber = new TextDecoder().decode(buff.slice(0, n)).trim();
  if (n <= 2 || !Number.isInteger(+decodedNumber)) {
    conn.write(encoder.encode("Invalid Number\n"));
    return await askNnumber(conn);
  }

  return +decodedNumber;
};

const broadCast = async (string, clients) => {
  const encoder = new TextEncoder();
  for (const { connection } of clients) {
    await connection.write(encoder.encode(string));
  }
};

const startRound = async (clients, number) => {
  const encoder = new TextEncoder();

  let winner = null;
  await broadCast("\nGame started! Guess the number.\n", clients);
  while (!winner) {
    for (const player of clients) {
      await broadCast(`Currently ${player.name} is Playing\n\n`, clients);
      const guess = await askNnumber(player.connection);

      if (guess > number) {
        await player.connection.write(encoder.encode("Too high\n"));
      } else if (guess < number) {
        await player.connection.write(encoder.encode("Too low\n"));
      } else {
        winner = player.name;
        break;
      }
    }
  }

  for (const { connection } of clients) {
    connection.write(
      encoder.encode(`${winner} Won the Game The Number Was ${number}\n`),
    );
    connection.close();
  }
};

const handleClients = async (clients, conn, number, MAX_PLAYERS, pending) => {
  const encoder = new TextEncoder();

  if (clients.size + pending[0] >= MAX_PLAYERS) {
    await conn.write(
      encoder.encode("Game already started Or Lobby Is Full. Try later.\n"),
    );
    conn.close();
    return;
  }

  pending[0]++;
  const player = await registerPlayer(conn);
  pending[0]--;
  clients.add(player);

  await conn.write(encoder.encode("Waiting for other players...\n"));

  console.log(`${player.name} joined`);

  if (clients.size === MAX_PLAYERS) {
    startRound(clients, number);
  }
};

export const startGame = async (listeners) => {
  const clients = new Set();
  const number = generateRandomNumber();
  const MAX_PLAYERS = +prompt("How many Player Can Join:- ");
  const pending = [0];

  console.log(`Generated Number is ${number}`);

  for await (const conn of listeners) {
    handleClients(clients, conn, number, MAX_PLAYERS, pending);
  }
};
