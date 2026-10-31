import { Link } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import Loader from '../components/Loader.jsx';
import ErrorState from '../components/ErrorState.jsx';
import './Home.css';

const rupee = (n) => '₹' + Number(n).toLocaleString('en-IN');

function Home() {
  const { data, loading, error, reload } = useFetch('/pricing');
  const p = data?.pricing;

  return (
    <div>
      <section className="hero">
        <img src="/logo.png" alt="Nestora Hostel Management System" className="hero-logo" />
        <div>
          <h1>A calm, organised home for 288 students.</h1>
          <p className="muted hero-text">
            Four boys' blocks, one mess, clear fees. Register, get a room, pay your dues and
            raise complaints, all in one place.
          </p>
          <div className="row">
            <Link className="btn btn-accent" to="/register">Register as student</Link>
            <Link className="btn btn-outline" to="/login">Login</Link>
          </div>
        </div>
      </section>

      <section className="mt">
        <h2>Rate card</h2>
        <p className="page-sub">Monthly room rent by room type. Mess charge and deposit are listed below.</p>

        {loading && <Loader />}
        {error && <ErrorState message={error} onRetry={reload} />}

        {p && (
          <>
            <div className="table-wrap rate-card">
              <table>
                <thead>
                  <tr><th>Room type</th><th>Beds</th><th>AC</th><th>Non-AC</th></tr>
                </thead>
                <tbody>
                  <tr><td>Single</td><td>1</td><td>{rupee(p.rents.single_ac)}</td><td>{rupee(p.rents.single_nonac)}</td></tr>
                  <tr><td>Double</td><td>2</td><td>{rupee(p.rents.double_ac)}</td><td>{rupee(p.rents.double_nonac)}</td></tr>
                  <tr><td>Triple</td><td>3</td><td>{rupee(p.rents.triple_ac)}</td><td>{rupee(p.rents.triple_nonac)}</td></tr>
                </tbody>
              </table>
            </div>

            <div className="table-wrap rate-card mt">
              <table>
                <tbody>
                  <tr><td>Mess charge (per month)</td><td>{rupee(p.messCharge)}</td></tr>
                  <tr><td>Security deposit (one time, refunded when you leave)</td><td>{rupee(p.securityDeposit)}</td></tr>
                </tbody>
              </table>
            </div>

            <p className="muted mt">
              Rent and mess are paid in advance between the 1st and 5th of each month. Blocks A and B are AC,
              Blocks C and D are non-AC. No admission fee and no late fee.
            </p>
          </>
        )}
      </section>
    </div>
  );
}

export default Home;