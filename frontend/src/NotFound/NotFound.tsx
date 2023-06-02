import { useNavigate } from 'react-router-dom';
import './NotFound.css';

function NotFound() {
    const nav = useNavigate();

    return (
        <div id="not-found">
            <p>404<br/>NOT FOUND</p>
            <button onClick={() => nav('/main')}>HOME</button>
        </div>
    )
}

export default NotFound;