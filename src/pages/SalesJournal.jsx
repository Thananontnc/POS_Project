import React, { useState, useEffect } from 'react';
import { getProducts, getTransactions, addTransaction } from '../lib/storage';
import { Plus, Search } from 'lucide-react';

const SalesJournal = () => {
    const [products] = useState(getProducts());
    const [transactions, setTransactions] = useState([]);

    const [selectedProduct, setSelectedProduct] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        setTransactions(getTransactions());
    }, []);

    const handleAdd = (e) => {
        e.preventDefault();
        if (!selectedProduct || quantity <= 0) return;

        const product = products.find(p => p.itemName === selectedProduct);
        if (!product) return;

        const total = product.unitPrice * quantity;

        const newTx = addTransaction({
            date: saleDate,
            itemName: product.itemName,
            category: product.category,
            unitPrice: product.unitPrice,
            quantity: parseInt(quantity),
            totalPrice: total
        });

        setTransactions([newTx, ...transactions]);

        setQuantity(1);
    };

    const filteredTransactions = transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    const currentProduct = products.find(p => p.itemName === selectedProduct);
    const calculatedTotal = currentProduct ? currentProduct.unitPrice * quantity : 0;

    return (
        <div className="fade-in">
            <header style={{ marginBottom: '2rem' }}>
                <h2>Sales Journal</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Record and view sales transactions</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>

                {/* Form Section */}
                <div className="glass-panel card">
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Plus size={20} className="text-accent" /> New Entry
                    </h3>

                    <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Search Product</label>
                            <div style={{ position: 'relative' }}>
                                <Search size={16} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--text-secondary)' }} />
                                <input
                                    type="text"
                                    placeholder="Filter products..."
                                    className="input-field"
                                    style={{ paddingLeft: '2.5rem' }}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Select Item</label>
                            <select
                                className="input-field"
                                value={selectedProduct}
                                onChange={e => setSelectedProduct(e.target.value)}
                                required
                            >
                                <option value="">-- Choose Product --</option>
                                {products
                                    .filter(p => p.itemName.toLowerCase().includes(searchTerm.toLowerCase()))
                                    .map(p => (
                                        <option key={p.itemName} value={p.itemName}>
                                            {p.itemName} ({p.unitPrice} THB)
                                        </option>
                                    ))}
                            </select>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Quantity</label>
                                <input
                                    type="number"
                                    min="1"
                                    className="input-field"
                                    value={quantity}
                                    onChange={e => setQuantity(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Date</label>
                                <input
                                    type="date"
                                    className="input-field"
                                    value={saleDate}
                                    onChange={e => setSaleDate(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div style={{ background: 'var(--table-row-hover)', padding: '1rem', borderRadius: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--card-border)' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Total Price</span>
                            <span style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--accent-color)' }}>
                                {calculatedTotal.toLocaleString()} THB
                            </span>
                        </div>

                        <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                            Record Transaction
                        </button>

                    </form>
                </div>

                {/* Table Section */}
                <div className="glass-panel card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>Transaction History</h3>
                    <div style={{ overflowY: 'auto', flex: 1, maxHeight: '600px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                            <thead style={{ position: 'sticky', top: 0, background: 'var(--card-bg)', backdropFilter: 'blur(12px)', zIndex: 10 }}>
                                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--card-border)' }}>
                                    <th style={{ padding: '1rem' }}>Date</th>
                                    <th style={{ padding: '1rem' }}>Product</th>
                                    <th style={{ padding: '1rem' }}>Category</th>
                                    <th style={{ padding: '1rem', textAlign: 'center' }}>Qty</th>
                                    <th style={{ padding: '1rem', textAlign: 'right' }}>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTransactions.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                            No transactions recorded yet.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredTransactions.map((tx) => (
                                        <tr key={tx.id} style={{ borderBottom: '1px solid var(--card-border)', transition: 'background 0.2s' }}>
                                            <td style={{ padding: '1rem' }}>{tx.date}</td>
                                            <td style={{ padding: '1rem', fontWeight: '500' }}>{tx.itemName}</td>
                                            <td style={{ padding: '1rem', opacity: 0.7 }}>{tx.category}</td>
                                            <td style={{ padding: '1rem', textAlign: 'center' }}>{tx.quantity}</td>
                                            <td style={{ padding: '1rem', textAlign: 'right', color: 'var(--accent-color)' }}>{tx.totalPrice.toLocaleString()}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default SalesJournal;
