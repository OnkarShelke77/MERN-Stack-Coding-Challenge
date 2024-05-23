import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Dropdown from './Dropdown'; // Ensure this file exists
import './App.css'; // Import the CSS file

const App = () => {
  const [selectedMonth, setSelectedMonth] = useState('March');
  const [transactions, setTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get('/api/transactions', {
          params: { month: selectedMonth, search: searchQuery, page }
        });
        setTransactions(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        setTransactions([]);
      }
    };

    fetchTransactions();
  }, [selectedMonth, searchQuery, page]);

  return (
    <div className="container">
      <h1 className="dashboard-title">Transactions Dashboard</h1>
      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="Search transactions"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Dropdown className="dropdown" selectedMonth={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} />
      </div>
      <table className="transactions-table">
        <thead>
          <tr>
            <th>Id</th>
            <th>Title</th>
            <th>Description</th>
            <th>Price</th>
            <th>Category</th>
            <th>Sold</th>
            <th>Image</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(transactions) && transactions.length > 0 ? (
            transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td>{transaction.id}</td>
                <td>{transaction.title}</td>
                <td className="center-text">{transaction.description}</td>
                <td>{transaction.price}</td>
                <td>{transaction.category}</td>
                <td>{transaction.sold ? 'Yes' : 'No'}</td>
                <td><img src={transaction.image} alt={transaction.title} className="transaction-image" /></td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7">No transactions found</td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="pagination">
        <span className="page-info-left">Page No: {page}</span>
        <div className="pagination-buttons">
          <button onClick={() => setPage(page - 1)} disabled={page === 1}>
            Previous
          </button>
          <button onClick={() => setPage(page + 1)}>
            Next
          </button>
        </div>
        <span className="page-info-right">Page No: {page}</span>
      </div>
    </div>
  );
};

export default App;
