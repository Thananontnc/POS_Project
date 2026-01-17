import React, { useState, useEffect, useMemo } from 'react';
import { getTransactions } from '../lib/storage';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { TrendingUp, DollarSign, ShoppingBag, Calendar } from 'lucide-react';

const COLORS = ['#38bdf8', '#818cf8', '#34d399', '#f472b6', '#fbbf24', '#a78bfa'];

import { format, startOfWeek, parseISO } from 'date-fns';

const Dashboard = () => {
    const [transactions, setTransactions] = useState([]);
    const [period, setPeriod] = useState('monthly'); // daily, weekly, monthly
    useEffect(() => {
        setTransactions(getTransactions());
    }, []);

    const filteredTransactions = useMemo(() => {
        return transactions;
    }, [transactions]);

    // Aggregations
    const stats = useMemo(() => {
        const totalSales = transactions.reduce((sum, tx) => sum + tx.totalPrice, 0);
        const totalItems = transactions.reduce((sum, tx) => sum + tx.quantity, 0);
        const totalTx = transactions.length;
        return { totalSales, totalItems, totalTx };
    }, [transactions]);

    const trendData = useMemo(() => {
        const groups = {};
        transactions.forEach(tx => {
            let key = tx.date;
            if (period === 'monthly') {
                key = tx.date.substring(0, 7); // YYYY-MM
            } else if (period === 'weekly') {
                // ISO Week
                const date = parseISO(tx.date);
                key = format(startOfWeek(date), 'yyyy-MM-dd'); // Group by start of week
            }
            // daily is default (YYYY-MM-DD)

            if (!groups[key]) groups[key] = 0;
            groups[key] += tx.totalPrice;
        });

        // Calculate Period Total for the card
        const periodTotal = Object.values(groups).reduce((a, b) => a + b, 0);

        return {
            chart: Object.keys(groups).sort().map(date => ({
                name: date,
                sales: groups[date]
            })),
            periodTotal
        };
    }, [transactions, period]);

    const categoryData = useMemo(() => {
        const groups = {};
        transactions.forEach(tx => {
            if (!groups[tx.category]) groups[tx.category] = 0;
            groups[tx.category] += tx.totalPrice;
        });
        return Object.keys(groups).map(cat => ({
            name: cat.replace('_', ' '),
            value: groups[cat]
        }));
    }, [transactions]);

    const topProducts = useMemo(() => {
        const groups = {};
        transactions.forEach(tx => {
            if (!groups[tx.itemName]) groups[tx.itemName] = 0;
            groups[tx.itemName] += tx.quantity;
        });

        return Object.entries(groups)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, qty]) => ({ name, qty }));
    }, [transactions]);

    return (
        <div className="fade-in">
            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2>Dashboard</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Overview of your store performance</p>
                </div>

                <div className="glass-panel" style={{ padding: '0.25rem', display: 'flex', gap: '0.25rem', borderRadius: '0.5rem' }}>
                    {['daily', 'weekly', 'monthly'].map(p => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '0.25rem',
                                background: period === p ? 'var(--accent-color)' : 'transparent',
                                color: period === p ? '#0f172a' : 'var(--text-secondary)',
                                fontWeight: period === p ? '600' : '500',
                                textTransform: 'capitalize'
                            }}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </header>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <StatCard
                    icon={<DollarSign size={24} color="var(--accent-color)" />}
                    title="Total Sales (All Time)"
                    value={`${stats.totalSales.toLocaleString()} THB`}
                />
                <StatCard
                    icon={<TrendingUp size={24} color="#fbbf24" />}
                    title={`Sales (${period})`}
                    value={`${trendData.periodTotal.toLocaleString()} THB`}
                />
                <StatCard
                    icon={<ShoppingBag size={24} color="#34d399" />}
                    title="Total Items Sold"
                    value={stats.totalItems.toLocaleString()}
                />
                <StatCard
                    icon={<Calendar size={24} color="#f472b6" />}
                    title="Total Transactions"
                    value={stats.totalTx.toLocaleString()}
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>

                {/* Line Chart */}
                <div className="glass-panel card" style={{ height: '400px' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>Sales Trends ({period})</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendData.chart}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" />
                            <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{ fontSize: 12 }} />
                            <YAxis stroke="var(--text-secondary)" tick={{ fontSize: 12 }} />
                            <RechartsTooltip
                                contentStyle={{
                                    backgroundColor: 'var(--card-bg)',
                                    borderColor: 'var(--card-border)',
                                    color: 'var(--text-primary)',
                                    borderRadius: '8px',
                                    backdropFilter: 'blur(8px)'
                                }}
                                itemStyle={{ color: 'var(--text-primary)' }}
                            />
                            <Line type="monotone" dataKey="sales" stroke="var(--accent-color)" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Top 5 Items */}
                <div className="glass-panel card">
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <TrendingUp size={20} className="text-accent" /> Top 5 Selling Items
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {topProducts.length === 0 ? <p style={{ color: 'var(--text-secondary)' }}>No sales data yet.</p> : null}
                        {topProducts.map((item, index) => (
                            <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid var(--card-border)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <span style={{
                                        width: '24px', height: '24px', borderRadius: '50%', background: 'var(--table-row-hover)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold'
                                    }}>
                                        {index + 1}
                                    </span>
                                    <span style={{ fontWeight: '500' }}>{item.name}</span>
                                </div>
                                <span style={{ color: 'var(--accent-color)', fontWeight: '600' }}>{item.qty} units</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                {/* Pie Chart */}
                <div className="glass-panel card" style={{ height: '400px' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>Sales Proportion by Category</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={categoryData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={120}
                                fill="#8884d8"
                                dataKey="value"
                                label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                            >
                                {categoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <RechartsTooltip contentStyle={{
                                backgroundColor: 'var(--card-bg)',
                                borderColor: 'var(--card-border)',
                                color: 'var(--text-primary)',
                                borderRadius: '8px',
                                backdropFilter: 'blur(8px)'
                            }} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

        </div>
    );
};

const StatCard = ({ icon, title, value }) => (
    <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ padding: '1rem', background: 'var(--table-row-hover)', borderRadius: '0.75rem' }}>
            {icon}
        </div>
        <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>{title}</p>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)' }}>{value}</div>
        </div>
    </div>
);

export default Dashboard;
// Dashboard logic
