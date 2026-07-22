import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <div className="home-content-grid">

        {/* Left Column: Description */}
        <div>
          <h1 className="home-title">Короткий опис</h1>
          <section className="home-description-section">
            <div className="home-text-content">
              <p><b>KRONA</b> — корпусний менеджер для аналізу текстів.
              <br/>Система забезпечує конкордансний пошук (KWIC) та побудову частотних списків, що дозволяє виявляти
              закономірності контекстуального вживання одиниць мови та створювати списки слів за частотністю.</p>
              <p>Особливості роботи з корпусом:</p>
              <ol className="home-list">
                <li className="home-list-item-shifted"> <b>Формування підкорпусів із готового корпусу:</b> користувач може створити власний підкорпус на основі
                різноманітних метаданих.</li>
                <li> <b>Створення користувацьких підкорпусів:</b> система підтримує інтеграцію власних текстів у вигляді окремих
                підкорпусів, які функціонують незалежно від основного корпусу, забезпечуючи безпечне тестування гіпотез
                і порівняльний аналіз. </li>
              </ol>
              <p>Завдяки цьому інструментарію дослідник отримує можливість не лише виявляти частотні та контекстуальні
              закономірності, але й здійснювати гнучкі, контрольовані експерименти з текстовими даними, зберігаючи
              наукову репрезентативність корпусу. </p>
            </div>
          </section>
        </div>

        {/* Right Column: Functionality */}
        <section className="home-functionality-section">
          <h1 className="home-title-center">Функціонал</h1>

          <div className="home-buttons-container">
            {/* Navigation buttons */}
            <Link to="/corpus-manager" className="home-nav-button">
                Пошук у корпусі
            </Link>

            <Link to="/concordance" className="home-nav-button">
                Конкорданс
            </Link>

            <Link to="/word-lists" className="home-nav-button">
                Частотний список
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Home;