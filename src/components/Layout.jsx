import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ReceiptText, Store } from 'lucide-react';

const Layout = ({ children }) => {
    return (
        <div className="layout-container">
            <aside className="sidebar">
                <div style={{ padding: '0 1rem' }}>
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem', color: 'var(--accent-color)' }}>
                        <Store size={28} />
                        POS System
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                        Store Management
                    </p>
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <NavLink
                        to="/"
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                        end
                    >
                        <LayoutDashboard size={20} />
                        Dashboard
                    </NavLink>
                    <NavLink
                        to="/journal"
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                        <ReceiptText size={20} />
                        Sales Journal
                    </NavLink>
                </nav>

                <div style={{ marginTop: 'auto', color: 'var(--text-secondary)', fontSize: '0.75rem', padding: '0 1rem' }}>
                    <p>© 2024 POS Inc.</p>
                </div>
            </aside>
            <main className="main-content">
                {children}
            </main>
        </div>
    );
};

export default Layout;
