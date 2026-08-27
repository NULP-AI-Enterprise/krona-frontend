import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import CorpusManager from "../../assets/images/sidebar/corpus_manager_icon.png";
import Concordance from "../../assets/images/sidebar/concordance_icon.png";
import Wordlist from "../../assets/images/sidebar/wordlist_icon.png";
import Keywords from "../../assets/images/sidebar/key_words.png";
import NGrams from "../../assets/images/sidebar/n_grams.png";
import './Sidebar.css';

const Sidebar = () => {
    const navigate = useNavigate();
    
    

    const goTo = (path) => {
        navigate(path);
    };

    return (
        <aside className="sidebar-container">
            <Button className="sidebar-btn" onClick={() => goTo('/corpus-manager')} title="Пошук у корпусі">
                <img src={CorpusManager} alt="Corpus manager" ></img>
            </Button>

            <Button className="sidebar-btn" onClick={() => goTo('/concordance')} title="Конкордансний пошук">
                <img src={Concordance} alt="Concordance"></img>
            </Button>

            <Button className="sidebar-btn" onClick={() => goTo('/word-lists')} title="Частотний список">
                <img src={Wordlist} alt="Wordlist"></img>
            </Button>

            {/* Дані кнопки забрані, через нереалізований відповідний їм функціонал */}
            <Button className="sidebar-btn" onClick={() => goTo('/keywords')} title="Key Words" sx={{ display: 'none' }}>
                <img src={Keywords} alt="Keywords"></img>
            </Button>

            <Button className="sidebar-btn" onClick={() => goTo('/n-grams')} title="N-Grams" sx={{ display: 'none' }}>
                <img src={NGrams} alt="NGrams"></img>
            </Button>
        </aside>
    );
};

export default Sidebar;