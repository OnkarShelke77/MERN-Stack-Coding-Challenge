const axios = require('axios');
const Transaction = require('../models/transaction');

// Initialize database with seed data
exports.initializeDatabase = async (req, res) => {
  try {
    const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
    const transactions = response.data;
    
    // Clear the existing collection and insert new data
    await Transaction.deleteMany({});
    await Transaction.insertMany(transactions);
    
    res.status(200).send('Database initialized successfully with seed data.');
  } catch (error) {
    res.status(500).send('Error initializing database: ' + error.message);
  }
};

// List all transactions with search and pagination
exports.listTransactions = async (req, res) => {
  const { page = 1, perPage = 10, search = '' } = req.query;
  const query = search
    ? {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { price: { $regex: search, $options: 'i' } }
        ]
      }
    : {};

  try {
    const transactions = await Transaction.find(query)
      .skip((page - 1) * perPage)
      .limit(Number(perPage));
    res.json(transactions);
  } catch (error) {
    res.status(500).send('Error fetching transactions: ' + error.message);
  }
};

// Get statistics for a selected month
exports.getStatistics = async (req, res) => {
  const { month } = req.query;
  const startDate = new Date(`${month} 1, 2023`);
  const endDate = new Date(startDate);
  endDate.setMonth(startDate.getMonth() + 1);

  try {
    const transactions = await Transaction.find({
      dateOfSale: { $gte: startDate, $lt: endDate }
    });
    
    const totalSales = transactions.reduce((sum, trans) => sum + trans.price, 0);
    const soldItems = transactions.filter(trans => trans.sold).length;
    const notSoldItems = transactions.filter(trans => !trans.sold).length;

    res.json({
      totalSales,
      soldItems,
      notSoldItems
    });
  } catch (error) {
    res.status(500).send('Error fetching statistics: ' + error.message);
  }
};

// Get bar chart data for a selected month
exports.getBarChartData = async (req, res) => {
  const { month } = req.query;
  const startDate = new Date(`${month} 1, 2023`);
  const endDate = new Date(startDate);
  endDate.setMonth(startDate.getMonth() + 1);

  try {
    const transactions = await Transaction.find({
      dateOfSale: { $gte: startDate, $lt: endDate }
    });
    
    const priceRanges = [
      { range: '0-100', count: 0 },
      { range: '101-200', count: 0 },
      { range: '201-300', count: 0 },
      { range: '301-400', count: 0 },
      { range: '401-500', count: 0 },
      { range: '501-600', count: 0 },
      { range: '601-700', count: 0 },
      { range: '701-800', count: 0 },
      { range: '801-900', count: 0 },
      { range: '901-above', count: 0 }
    ];
    
    transactions.forEach(trans => {
      if (trans.price <= 100) priceRanges[0].count++;
      else if (trans.price <= 200) priceRanges[1].count++;
      else if (trans.price <= 300) priceRanges[2].count++;
      else if (trans.price <= 400) priceRanges[3].count++;
      else if (trans.price <= 500) priceRanges[4].count++;
      else if (trans.price <= 600) priceRanges[5].count++;
      else if (trans.price <= 700) priceRanges[6].count++;
      else if (trans.price <= 800) priceRanges[7].count++;
      else if (trans.price <= 900) priceRanges[8].count++;
      else priceRanges[9].count++;
    });

    res.json(priceRanges);
  } catch (error) {
    res.status(500).send('Error fetching bar chart data: ' + error.message);
  }
};

// Get pie chart data for a selected month
exports.getPieChartData = async (req, res) => {
  const { month } = req.query;
  const startDate = new Date(`${month} 1, 2023`);
  const endDate = new Date(startDate);
  endDate.setMonth(startDate.getMonth() + 1);

  try {
    const transactions = await Transaction.find({
      dateOfSale: { $gte: startDate, $lt: endDate }
    });
    
    const categories = {};
    
    transactions.forEach(trans => {
      categories[trans.category] = categories[trans.category] + 1 || 1;
    });

    res.json(categories);
  } catch (error) {
    res.status(500).send('Error fetching pie chart data: ' + error.message);
  }
};

// Combine all data from above APIs
exports.getCombinedData = async (req, res) => {
  try {
    const [statistics, barChartData, pieChartData] = await Promise.all([
      exports.getStatistics(req, res),
      exports.getBarChartData(req, res),
      exports.getPieChartData(req, res)
    ]);

    res.json({
      statistics,
      barChartData,
      pieChartData
    });
  } catch (error) {
    res.status(500).send('Error fetching combined data: ' + error.message);
  }
};
