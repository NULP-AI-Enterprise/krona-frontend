import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import './Sidebar.css';

const Sidebar = () => {
    const navigate = useNavigate();
    const userRole = localStorage.getItem('user_role');
    const isAdmin = ['SUPER_ADMIN', 'ADMIN'].includes(userRole);

    const goTo = (path) => {
        navigate(path);
    };

    return (
        <aside className="sidebar-container">
            <Button className="sidebar-btn" onClick={() => goTo('/corpus-manager')} title="Пошук у корпусі">
                <img src="src/assets/images/sidebar/corpus_manager_icon.png" alt="Corpus manager" ></img>
            </Button>

            <Button className="sidebar-btn" onClick={() => goTo('/concordance')} title="Конкордансний пошук">
                <img src="src/assets/images/sidebar/concordance_icon.png" alt="Concordance"></img>
            </Button>

            <Button className="sidebar-btn" onClick={() => goTo('/word-lists')} title="Частотний список">
                <img src="src/assets/images/sidebar/wordlist_icon.png" alt="Wordlist"></img>
            </Button>

            {/* Дані кнопки забрані, через нереалізований відповідний їм функціонал */}
            <Button className="sidebar-btn" onClick={() => goTo('/keywords')} title="Key Words" sx={{ display: 'none' }}>
                <img src="src/assets/images/sidebar/key_words.png" alt="Keywords"></img>
            </Button>

            <Button className="sidebar-btn" onClick={() => goTo('/n-grams')} title="N-Grams" sx={{ display: 'none' }}>
                <img src="src/assets/images/sidebar/n_grams.png" alt="NGrams"></img>
            </Button>

            {isAdmin && (
                <Button className="sidebar-btn" onClick={() => goTo('/admin')} title="Адмін панель">
                    <AdminPanelSettingsIcon sx={{ fontSize: 32, color: 'var(--color-text-main, #5A3E29)' }} />
                </Button>
            )}
        </aside>
    );
};

export default Sidebar;