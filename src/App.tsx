import { Routes, Route } from "react-router-dom";
import AppLayout from "./MainLayout";
import HomeScreen from "./screens/HomeScreen";
import ProfileScreen from "./screens/ProfileScreen";
import GameScreen from "./screens/GameScreen";
import GameRoomScreen from "./screens/GameRoomScreen";

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/profile" element={<ProfileScreen />} />
        <Route path="/game" element={<GameScreen />} />
        <Route path="/game-room" element={<GameRoomScreen />} />
      </Route>
    </Routes>
  );
}

export default App;