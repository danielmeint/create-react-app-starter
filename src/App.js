import logo from "./logo.svg";
import "./App.css";
import { useEffect, useState } from "react";

function App() {
  const [ws, setWs] = useState(null);
  const [id, setId] = useState(null); // id of the current user
  const [username, setUsername] = useState("");
  const [games, setGames] = useState([]); // list of games
  const [users, setUsers] = useState([]); // list of users: {username, score}
  const [activeGame, setActiveGame] = useState(""); // name of the active game
  const [questionNumber, setQuestionNumber] = useState(0);
  const [answer, setAnswer] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // const socket = new WebSocket("wss://server-production-6aa3.up.railway.app");
    const socket = new WebSocket("ws://localhost:3001");
    socket.onopen = () => {
      console.log("Connected to the server");
      setWs(socket);
    };

    socket.onmessage = (event) => {
      console.log("Message from server:", event.data);
      // Handle incoming messages

      // const data = JSON.parse(event.data);
      try {
        var data = JSON.parse(event.data);
      } catch (e) {
        console.log("Error parsing JSON", e);
        return;
      }
      // add to message list
      setMessages((prev) => [...prev, data.message]);

      switch (data.type) {
        case "id":
          // Handle getting id
          setId(data.id);
          break;
        case "games":
          // Handle getting game list
          setGames(data.games);
          break;
        case "users":
          // Handle getting user list
          setUsers(data.users);
          break;
        case "activeGame":
          // Handle getting active game
          setActiveGame(data.game);
          break;
        case "update":
          // Handle game update message
          console.log("Game update", data);
          break;
        // ... other cases for different message types ...
        default:
          console.log("Unknown message type", data.type);
      }
    };

    socket.onclose = () => {
      console.log("Disconnected from the server");
      setWs(null);
    };

    return () => {
      socket.close();
    };
  }, []);

  function handleSetUsername() {
    if (ws) {
      ws.send(JSON.stringify({ type: "setUsername", username }));
      console.log("Set username to", username);
    }
  }

  function handleCreateGame(gameToCreate) {
    if (ws) {
      ws.send(JSON.stringify({ type: "createGame", game: gameToCreate }));
    }
  }

  function handleJoinGame(gameToJoin) {
    if (ws) {
      ws.send(JSON.stringify({ type: "joinGame", game: gameToJoin }));
    }
  }

  function handleAnswer(answer) {
    setAnswer(answer);
    if (ws) {
      ws.send(JSON.stringify({ type: "answer", answer }));
    }
  }

  return (
    <div>
      <p>Current user id: {id}</p>
      <input
        type="text"
        placeholder="Enter username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <button onClick={handleSetUsername}>Set Username</button>

      {/* Other components will go here */}
      <p>Active game: {activeGame}</p>
      <CreateGameForm onSubmit={handleCreateGame} />
      <JoinGameSelect games={games} onSubmit={handleJoinGame} />

      <MessageList messages={messages} />
      <GameList games={games} />
      <p>Question number: {questionNumber}</p>
      <p>Answer: {answer}</p>
      <AnswerForm onSubmit={handleAnswer} />
      <UserTable users={users} />
    </div>
  );
}

const UserTable = ({ users }) => {
  return (
    <table>
      <thead>
        <tr>
          <th>Username</th>
          <th>Score</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr>
            <td>{user.username}</td>
            <td>{user.score}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const CreateGameForm = ({ onSubmit }) => {
  const [game, setGame] = useState("");
  return (
    <div>
      <input
        type="text"
        placeholder="Enter game name"
        value={game}
        onChange={(e) => setGame(e.target.value)}
      />
      <button onClick={() => onSubmit(game)}>Create Game</button>
    </div>
  );
};

const JoinGameSelect = ({ games, onSubmit }) => {
  const [game, setGame] = useState("");
  return (
    <div>
      <select value={game} onChange={(e) => setGame(e.target.value)}>
        <option value="">Select a game</option>
        {games.map((game) => (
          <option value={game}>{game}</option>
        ))}
      </select>
      <button onClick={() => onSubmit(game)}>Join Game</button>
    </div>
  );
};

const Game = ({ game }) => {
  return <div>{game}</div>;
};

const GameList = ({ games }) => {
  console.log("games", games);
  return (
    <ul>
      {games.map((game) => (
        <Game game={game} />
      ))}
    </ul>
  );
};

const Message = ({ message }) => {
  return <div>{message}</div>;
};

const MessageList = ({ messages }) => {
  return (
    <div>
      {messages.map((message) => (
        <Message message={message} />
      ))}
    </div>
  );
};

const UsernameForm = ({ onSubmit }) => {
  const [username, setUsername] = useState("");
  return (
    <div>
      <input
        type="text"
        placeholder="Enter username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <button onClick={() => onSubmit(username)}>Set Username</button>
    </div>
  );
};

const AnswerButton = ({ answer, selected, onClick }) => {
  return (
    <button
      onClick={() => {
        onClick();
      }}
      disabled={selected}
    >
      {answer}
    </button>
  );
};

const AnswerForm = ({ onSubmit }) => {
  // choose A, B, C
  const [answer, setAnswer] = useState("");
  // three buttons and a confirm button
  return (
    <div>
      <AnswerButton
        answer="A"
        selected={answer === "A"}
        onClick={() => setAnswer("A")}
      />
      <AnswerButton
        answer="B"
        selected={answer === "B"}
        onClick={() => setAnswer("B")}
      />
      <AnswerButton
        answer="C"
        selected={answer === "C"}
        onClick={() => setAnswer("C")}
      />
      <button onClick={() => onSubmit(answer)}>Confirm</button>
    </div>
  );
};

export default App;
