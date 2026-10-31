// Temporary page used by every route until the real page is built
function Placeholder({ title }) {
  return (
    <div>
      <h1 className="page-title">{title}</h1>
      <p className="page-sub">This page will be built in a later step.</p>
    </div>
  );
}

export default Placeholder;