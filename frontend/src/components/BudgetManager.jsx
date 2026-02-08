import { useState, useEffect } from 'react'
import { getExchangeRates, convertAmount } from '../services/exchangeRates'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import './BudgetManager.css'

function BudgetManager({ token }) {
    const API_URL = 'http://api.personal-dashboard.test/api'

    const [categories, setCategories] = useState([])
    const [transactions, setTransactions] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('transactions') // 'transactions' sau 'categories'

    // Category form state
    const [showCategoryForm, setShowCategoryForm] = useState(false)
    const [categoryForm, setCategoryForm] = useState({
        name: '',
        type: 'expense',
        color: '#EF4444'
    })

    // Transaction form state
    const [showTransactionForm, setShowTransactionForm] = useState(false)
    const [editingTransaction, setEditingTransaction] = useState(null)
    const [transactionForm, setTransactionForm] = useState({
        category_id: '',
        amount: '',
        currency: 'MDL',
        description: '',
        transaction_date: new Date().toISOString().split('T')[0],
        type: 'expense'
    })

    // Filter state
    const [dateFilter, setDateFilter] = useState('all') // 'all', 'thisMonth', 'lastMonth', 'custom'
    const [customDateRange, setCustomDateRange] = useState({
        start: '',
        end: ''
    })

    // Exchange rates state
    const [baseCurrency, setBaseCurrency] = useState('MDL')
    const [exchangeRates, setExchangeRates] = useState(null)
    const [loadingRates, setLoadingRates] = useState(true)

    // Load exchange rates
    useEffect(() => {
        const fetchRates = async () => {
            setLoadingRates(true)
            const rates = await getExchangeRates(baseCurrency)
            setExchangeRates(rates)
            setLoadingRates(false)
        }

        fetchRates()
    }, [baseCurrency])

    // Fetch categories
    const fetchCategories = async () => {
        try {
            const response = await fetch(`${API_URL}/categories`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
            const data = await response.json()
            setCategories(data)
        } catch (error) {
            console.error('Error fetching categories:', error)
        }
    }

    // Fetch transactions
    const fetchTransactions = async () => {
        try {
            const response = await fetch(`${API_URL}/transactions`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
            const data = await response.json()
            setTransactions(data)
        } catch (error) {
            console.error('Error fetching transactions:', error)
        }
    }

    // Load data on mount
    useEffect(() => {
        Promise.all([fetchCategories(), fetchTransactions()])
            .finally(() => setLoading(false))
    }, [])

    // Handle category submit
    const handleCategorySubmit = async (e) => {
        e.preventDefault()
        try {
            const response = await fetch(`${API_URL}/categories`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(categoryForm)
            })

            if (response.ok) {
                await fetchCategories()
                setCategoryForm({ name: '', type: 'expense', color: '#EF4444' })
                setShowCategoryForm(false)
            }
        } catch (error) {
            console.error('Error creating category:', error)
        }
    }

    // Handle transaction submit
    // Handle transaction submit (create OR update)
    const handleTransactionSubmit = async (e) => {
        e.preventDefault()
        try {
            const url = editingTransaction
                ? `${API_URL}/transactions/${editingTransaction.id}`
                : `${API_URL}/transactions`

            const method = editingTransaction ? 'PUT' : 'POST'

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(transactionForm)
            })

            if (response.ok) {
                await fetchTransactions()
                setTransactionForm({
                    category_id: '',
                    amount: '',
                    currency: 'MDL',
                    description: '',
                    transaction_date: new Date().toISOString().split('T')[0],
                    type: 'expense'
                })
                setEditingTransaction(null) // RESETEAZĂ
                setShowTransactionForm(false)
            }
        } catch (error) {
            console.error('Error saving transaction:', error)
        }
    }

    // Adaugă această funcție nouă pentru a închide modal-ul
    const handleCloseTransactionForm = () => {
        setShowTransactionForm(false)
        setEditingTransaction(null)
        setTransactionForm({
            category_id: '',
            amount: '',
            currency: 'MDL',
            description: '',
            transaction_date: new Date().toISOString().split('T')[0],
            type: 'expense'
        })
    }

    // Delete category
    const handleDeleteCategory = async (id) => {
        if (!confirm('Are you sure? This will delete all transactions in this category.')) return

        try {
            await fetch(`${API_URL}/categories/${id}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
            await fetchCategories()
            await fetchTransactions()
        } catch (error) {
            console.error('Error deleting category:', error)
        }
    }

    // Delete transaction
    const handleDeleteTransaction = async (id) => {
        if (!confirm('Delete this transaction?')) return

        try {
            await fetch(`${API_URL}/transactions/${id}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
            await fetchTransactions()
        } catch (error) {
            console.error('Error deleting transaction:', error)
        }
    }

    // Deschide form pentru edit
    const handleEditTransaction = (transaction) => {
        setEditingTransaction(transaction)
        setTransactionForm({
            category_id: transaction.category_id,
            amount: transaction.amount,
            currency: transaction.currency,
            description: transaction.description || '',
            transaction_date: transaction.transaction_date,
            type: transaction.type
        })
        setShowTransactionForm(true)
    }


    // Helper functions pentru date
    const getThisMonthRange = () => {
        const now = new Date()
        const start = new Date(now.getFullYear(), now.getMonth(), 1)
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        return { start, end }
    }

    const getLastMonthRange = () => {
        const now = new Date()
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const end = new Date(now.getFullYear(), now.getMonth(), 0)
        return { start, end }
    }

    const filterTransactionsByDate = (transactions) => {
        if (dateFilter === 'all') return transactions

        let startDate, endDate

        if (dateFilter === 'thisMonth') {
            const range = getThisMonthRange()
            startDate = range.start
            endDate = range.end
        } else if (dateFilter === 'lastMonth') {
            const range = getLastMonthRange()
            startDate = range.start
            endDate = range.end
        } else if (dateFilter === 'custom') {
            if (!customDateRange.start || !customDateRange.end) return transactions
            startDate = new Date(customDateRange.start)
            endDate = new Date(customDateRange.end)
        }

        return transactions.filter(t => {
            const tDate = new Date(t.transaction_date)
            return tDate >= startDate && tDate <= endDate
        })
    }

    // Filter transactions și calculate summary
    const filteredTransactions = filterTransactionsByDate(transactions)

    const summary = filteredTransactions.reduce((acc, t) => {
        const amount = parseFloat(t.amount)

        // Convertește în baseCurrency dacă avem rates
        let convertedAmount = amount
        if (exchangeRates && t.currency !== baseCurrency) {
            convertedAmount = convertAmount(amount, t.currency, baseCurrency, exchangeRates)
        }

        if (t.type === 'income') {
            acc.income += convertedAmount
        } else {
            acc.expense += convertedAmount
        }
        return acc
    }, { income: 0, expense: 0 })
    summary.balance = summary.income - summary.expense


    // Prepare data for charts
    const prepareChartData = (type) => {
        const categoryTotals = {}

        filteredTransactions
            .filter(t => t.type === type)
            .forEach(t => {
                const categoryName = t.category.name
                const amount = parseFloat(t.amount)

                // Convertește în baseCurrency dacă e nevoie
                let convertedAmount = amount
                if (exchangeRates && t.currency !== baseCurrency) {
                    convertedAmount = convertAmount(amount, t.currency, baseCurrency, exchangeRates)
                }

                if (categoryTotals[categoryName]) {
                    categoryTotals[categoryName].value += convertedAmount
                } else {
                    categoryTotals[categoryName] = {
                        name: categoryName,
                        value: convertedAmount,
                        color: t.category.color
                    }
                }
            })

        return Object.values(categoryTotals)
    }

    const expenseChartData = prepareChartData('expense')
    const incomeChartData = prepareChartData('income')

    // Chart state
    const [chartView, setChartView] = useState('expense') // 'expense' sau 'income'

    // Export transactions to CSV
    const exportToCSV = () => {
        if (filteredTransactions.length === 0) {
            alert('No transactions to export')
            return
        }

        // CSV Header
        const headers = ['Date', 'Type', 'Category', 'Amount', 'Currency', 'Description']

        // CSV Rows
        const rows = filteredTransactions.map(t => [
            t.transaction_date,
            t.type,
            t.category.name,
            t.amount,
            t.currency,
            t.description || ''
        ])

        // Combine header + rows
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n')

        // Create blob and download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)

        link.setAttribute('href', url)
        link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`)
        link.style.visibility = 'hidden'

        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }


    if (loading) return <div>Loading budget...</div>

    return (
        <div className="budget-manager">
            <div className="budget-header">
                <h2>💰 Budget Manager</h2>
                <div className="budget-header-actions">
                    <button
                        className="btn-export"
                        onClick={exportToCSV}
                        title="Export to CSV"
                    >
                        📥 Export
                    </button>
                    <select
                        className="currency-selector"
                        value={baseCurrency}
                        onChange={(e) => setBaseCurrency(e.target.value)}
                        disabled={loadingRates}
                    >
                        <option value="MDL">Summary in MDL</option>
                        <option value="EUR">Summary in EUR</option>
                        <option value="USD">Summary in USD</option>
                        <option value="RON">Summary in RON</option>
                    </select>
                    <button
                        className="btn-primary"
                        onClick={() => setShowTransactionForm(true)}
                    >
                        + Add Transaction
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="budget-summary">
                <div className="summary-card income">
                    <h3>Income</h3>
                    <p className="amount">
                        +{summary.income.toFixed(2)} {baseCurrency}
                        {loadingRates && <span className="loading-rates">🔄</span>}
                    </p>
                </div>
                <div className="summary-card expense">
                    <h3>Expenses</h3>
                    <p className="amount">
                        -{summary.expense.toFixed(2)} {baseCurrency}
                        {loadingRates && <span className="loading-rates">🔄</span>}
                    </p>
                </div>
                <div className="summary-card balance">
                    <h3>Balance</h3>
                    <p className="amount">
                        {summary.balance.toFixed(2)} {baseCurrency}
                        {loadingRates && <span className="loading-rates">🔄</span>}
                    </p>
                </div>
            </div>

            {/* Charts Section */}
            {(expenseChartData.length > 0 || incomeChartData.length > 0) && (
                <div className="charts-section">
                    <div className="charts-header">
                        <h3>Analytics</h3>
                        <div className="chart-toggle">
                            <button
                                className={chartView === 'expense' ? 'active' : ''}
                                onClick={() => setChartView('expense')}
                            >
                                Expenses
                            </button>
                            <button
                                className={chartView === 'income' ? 'active' : ''}
                                onClick={() => setChartView('income')}
                            >
                                Income
                            </button>
                        </div>
                    </div>

                    <div className="chart-container">
                        {chartView === 'expense' && expenseChartData.length > 0 && (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={expenseChartData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {expenseChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value) => `${value.toFixed(2)} ${baseCurrency}`}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        )}

                        {chartView === 'income' && incomeChartData.length > 0 && (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={incomeChartData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {incomeChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value) => `${value.toFixed(2)} ${baseCurrency}`}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        )}

                        {chartView === 'expense' && expenseChartData.length === 0 && (
                            <p className="empty-chart">No expense data for this period</p>
                        )}

                        {chartView === 'income' && incomeChartData.length === 0 && (
                            <p className="empty-chart">No income data for this period</p>
                        )}
                    </div>
                </div>
            )}

            {/* Date Filters */}
            <div className="date-filters">
                <button
                    className={dateFilter === 'all' ? 'active' : ''}
                    onClick={() => setDateFilter('all')}
                >
                    All Time
                </button>
                <button
                    className={dateFilter === 'thisMonth' ? 'active' : ''}
                    onClick={() => setDateFilter('thisMonth')}
                >
                    This Month
                </button>
                <button
                    className={dateFilter === 'lastMonth' ? 'active' : ''}
                    onClick={() => setDateFilter('lastMonth')}
                >
                    Last Month
                </button>
                <button
                    className={dateFilter === 'custom' ? 'active' : ''}
                    onClick={() => setDateFilter('custom')}
                >
                    Custom Range
                </button>
            </div>

            {/* Custom Date Range */}
            {dateFilter === 'custom' && (
                <div className="custom-date-range">
                    <input
                        type="date"
                        value={customDateRange.start}
                        onChange={(e) => setCustomDateRange({...customDateRange, start: e.target.value})}
                        placeholder="Start date"
                    />
                    <span>to</span>
                    <input
                        type="date"
                        value={customDateRange.end}
                        onChange={(e) => setCustomDateRange({...customDateRange, end: e.target.value})}
                        placeholder="End date"
                    />
                </div>
            )}

            {/* Tabs */}
            <div className="budget-tabs">
                <button
                    className={activeTab === 'transactions' ? 'active' : ''}
                    onClick={() => setActiveTab('transactions')}
                >
                    Transactions
                </button>
                <button
                    className={activeTab === 'categories' ? 'active' : ''}
                    onClick={() => setActiveTab('categories')}
                >
                    Categories
                </button>
            </div>

            {/* Transactions Tab */}
            {activeTab === 'transactions' && (
                <div className="transactions-list">
                    {filteredTransactions.length === 0 ? (
                        <p className="empty-state">No transactions for this period.</p>
                    ) : (
                        filteredTransactions.map(transaction => (
                            <div key={transaction.id} className="transaction-item">
                                <div className="transaction-info">
                                    <span
                                        className="category-badge"
                                        style={{ backgroundColor: transaction.category.color }}
                                    >
                                        {transaction.category.name}
                                    </span>
                                    <span className="transaction-description">
                                        {transaction.description || 'No description'}
                                    </span>
                                    <span className="transaction-date">
                                        {new Date(transaction.transaction_date).toLocaleDateString()}
                                    </span>
                                </div>
                                <button
                                    className="btn-edit"
                                    onClick={() => handleEditTransaction(transaction)}
                                    title="Edit"
                                >
                                    ✏️
                                </button>
                                <div className="transaction-actions">
                                    <span className={`transaction-amount ${transaction.type}`}>
                                        {transaction.type === 'income' ? '+' : '-'}
                                        {transaction.amount} {transaction.currency}
                                    </span>
                                    <button
                                        className="btn-delete"
                                        onClick={() => handleDeleteTransaction(transaction.id)}
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Categories Tab */}
            {activeTab === 'categories' && (
                <div className="categories-section">
                    <button
                        className="btn-secondary"
                        onClick={() => setShowCategoryForm(true)}
                    >
                        + Add Category
                    </button>

                    <div className="categories-list">
                        {categories.map(category => (
                            <div key={category.id} className="category-item">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span
                                        className="color-dot"
                                        style={{ backgroundColor: category.color }}
                                    ></span>
                                    <span>{category.name}</span>
                                    <span className="category-type">{category.type}</span>
                                </div>
                                <button
                                    className="btn-delete"
                                    onClick={() => handleDeleteCategory(category.id)}
                                >
                                    🗑️
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Transaction Form Modal */}
            {showTransactionForm && (
                <div className="modal-overlay" onClick={handleCloseTransactionForm}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>{editingTransaction ? 'Edit Transaction' : 'Add Transaction'}</h3>
                        <form onSubmit={handleTransactionSubmit}>
                            <div className="form-group">
                                <label>Type</label>
                                <select
                                    value={transactionForm.type}
                                    onChange={(e) => setTransactionForm({...transactionForm, type: e.target.value})}
                                >
                                    <option value="expense">Expense</option>
                                    <option value="income">Income</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Category</label>
                                <select
                                    value={transactionForm.category_id}
                                    onChange={(e) => setTransactionForm({...transactionForm, category_id: e.target.value})}
                                    required
                                >
                                    <option value="">Select category</option>
                                    {categories
                                        .filter(c => c.type === transactionForm.type)
                                        .map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))
                                    }
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Amount</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={transactionForm.amount}
                                    onChange={(e) => setTransactionForm({...transactionForm, amount: e.target.value})}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Currency</label>
                                <select
                                    value={transactionForm.currency}
                                    onChange={(e) => setTransactionForm({...transactionForm, currency: e.target.value})}
                                >
                                    <option value="MDL">MDL</option>
                                    <option value="EUR">EUR</option>
                                    <option value="USD">USD</option>
                                    <option value="RON">RON</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Date</label>
                                <input
                                    type="date"
                                    value={transactionForm.transaction_date}
                                    onChange={(e) => setTransactionForm({...transactionForm, transaction_date: e.target.value})}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <input
                                    type="text"
                                    value={transactionForm.description}
                                    onChange={(e) => setTransactionForm({...transactionForm, description: e.target.value})}
                                    placeholder="Optional"
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="submit" className="btn-primary">
                                    {editingTransaction ? 'Update' : 'Save'}
                                </button>
                                <button type="button" className="btn-secondary" onClick={handleCloseTransactionForm}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Category Form Modal */}
            {showCategoryForm && (
                <div className="modal-overlay" onClick={() => setShowCategoryForm(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Add Category</h3>
                        <form onSubmit={handleCategorySubmit}>
                            <div className="form-group">
                                <label>Name</label>
                                <input
                                    type="text"
                                    value={categoryForm.name}
                                    onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Type</label>
                                <select
                                    value={categoryForm.type}
                                    onChange={(e) => setCategoryForm({...categoryForm, type: e.target.value})}
                                >
                                    <option value="expense">Expense</option>
                                    <option value="income">Income</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Color</label>
                                <input
                                    type="color"
                                    value={categoryForm.color}
                                    onChange={(e) => setCategoryForm({...categoryForm, color: e.target.value})}
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="submit" className="btn-primary">Save</button>
                                <button type="button" className="btn-secondary" onClick={() => setShowCategoryForm(false)}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default BudgetManager