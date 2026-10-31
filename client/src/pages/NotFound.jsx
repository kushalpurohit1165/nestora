import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="state">
      <h2>404</h2>
      <p>This page does not exist.</p>
      <Link className="btn btn-outline btn-sm mt" to="/">Go home</Link>
    </div>
  );
}

export default NotFound;