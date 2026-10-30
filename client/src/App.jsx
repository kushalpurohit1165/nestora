// Temporary page just to check the fonts and colours. We replace it in Step 11c.
function App() {
  return (
    <div className="container page">
      <h1 className="page-title">Nestora</h1>
      <p className="page-sub">Hostel Management System</p>

      <div className="row mb">
        <button className="btn">Primary</button>
        <button className="btn btn-accent">Accent</button>
        <button className="btn btn-outline">Outline</button>
        <button className="btn btn-danger">Delete</button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Type</th><th>Amount</th><th>Status</th></tr>
          </thead>
          <tbody>
            <tr><td>Rent</td><td>₹4,500</td><td><span className="tag tag-paid">Paid</span></td></tr>
            <tr><td>Mess</td><td>₹3,000</td><td><span className="tag tag-overdue">Overdue</span></td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;