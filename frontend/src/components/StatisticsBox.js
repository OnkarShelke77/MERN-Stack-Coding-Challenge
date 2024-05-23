import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StatisticsBox = ({ selectedMonth }) => {
  const [statistics, setStatistics] = useState({ totalSales: 0, soldItems: 0, notSoldItems: 0 });

  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get('/api/statistics', { params: { month: selectedMonth } });
      setStatistics(response.data);
    };

    fetchData();
  }, [selectedMonth]);

  return (
    <div>
      <div>Total Sale Amount: {statistics.totalSales}</div>
      <div>Total Sold Items: {statistics.soldItems}</div>
      <div>Total Not Sold Items: {statistics.notSoldItems}</div>
    </div>
  );
};

export default StatisticsBox;
