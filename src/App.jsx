import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import CorpusManager from './pages/CorpusManager';
import Concordance from './pages/Concordance';
import Home from './pages/Home';
import Register from './pages/Register';
import WordLists from './pages/WordLists';
import Login from './pages/Login';
import UserPage from './pages/UserPage'
import AdminPanel from './pages/AdminPanel';
import ShareRedeem from './pages/ShareRedeem';
import { RequireRole, RequireAuth } from './components/guards';

const Keywords = () => <h2 style={{color: '#5A3E29'}}>Ключові слова (Key)</h2>;
const NGrams = () => <h2 style={{color: '#5A3E29'}}>N-грами (N-gr)</h2>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="corpus-manager" element={
            <RequireAuth><CorpusManager /></RequireAuth>
          } />
          <Route path="concordance" element={<Concordance />} />
          <Route path="register" element={<Register />} />
          <Route path="login" element={<Login />} />
          <Route path="user" element={<UserPage />} />
          <Route path="word-lists" element={<WordLists />} />
          <Route path="keywords" element={<Keywords />} />
          <Route path="n-grams" element={<NGrams />} />
          <Route path="admin" element={
            <RequireRole roles={['SUPER_ADMIN', 'ADMIN']}>
              <AdminPanel />
            </RequireRole>
          } />
          <Route path="redeem" element={
            <RequireAuth><ShareRedeem /></RequireAuth>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
