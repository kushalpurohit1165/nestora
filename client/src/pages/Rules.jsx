import useFetch from '../hooks/useFetch';
import Loader from '../components/Loader.jsx';
import ErrorState from '../components/ErrorState.jsx';
import EmptyState from '../components/EmptyState.jsx';

// Groups a list of items by their category: { General: [..], Timings: [..] }
const groupByCategory = (items) =>
  items.reduce((groups, item) => {
    (groups[item.category] = groups[item.category] || []).push(item);
    return groups;
  }, {});

function Section({ title, items }) {
  const groups = groupByCategory(items);
  return (
    <section className="mb">
      <h2 className="mb">{title}</h2>
      {items.length === 0 && <EmptyState text={`No ${title.toLowerCase()} added yet.`} />}
      <div className="grid grid-2">
        {Object.keys(groups).map((cat) => (
          <div className="card" key={cat}>
            <div className="label mb">{cat}</div>
            <ul style={{ paddingLeft: 18 }}>
              {groups[cat].map((i) => (
                <li key={i._id} style={{ marginBottom: 6 }}>{i.text}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

function Rules() {
  const { data, loading, error, reload } = useFetch('/info');
  const items = data?.items || [];

  return (
    <div>
      <h1 className="page-title">Rules and Facilities</h1>
      <p className="page-sub">Please read the rules carefully before joining.</p>

      {loading && <Loader />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {!loading && !error && (
        <>
          <Section title="Rules" items={items.filter((i) => i.kind === 'rule')} />
          <Section title="Facilities" items={items.filter((i) => i.kind === 'facility')} />
        </>
      )}
    </div>
  );
}

export default Rules;