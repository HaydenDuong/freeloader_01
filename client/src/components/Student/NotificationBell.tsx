import React, { useEffect, useState, useRef } from 'react';
import { notificationsAPI } from '../../utils/api';
import { Notification } from '../../types';
import './Student.css';

const POLL_INTERVAL_MS = 30000; // 30s polling for simplicity

const NotificationBell: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const [open, setOpen] = useState(false);
    const pollingRef = useRef<number | null>(null);

    const fetchNotifications = async () => {
        try {
            const [listRes, countRes] = await Promise.all([
                notificationsAPI.getNotifications(),
                notificationsAPI.getUnreadCount(),
            ]);
            setNotifications(listRes.notifications);
            setUnreadCount(countRes.count);
        } catch (e) {
            console.error('Failed to load notifications', e);
        }
    };

    const markAllRead = async () => {
        try {
            await notificationsAPI.markAllRead();
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        } catch (e) {
            console.error('Failed to mark notifications read', e);
        }
    };

    useEffect(() => {
        fetchNotifications();
        pollingRef.current = window.setInterval(fetchNotifications, POLL_INTERVAL_MS);
        return () => {
            if (pollingRef.current) window.clearInterval(pollingRef.current);
        };
    }, []);

    const toggleOpen = () => {
        const newOpen = !open;
        setOpen(newOpen);
        if (newOpen && unreadCount > 0) {
            markAllRead();
        }
    };

    return (
        <div className="notification-bell-wrapper">
            <button className="notification-bell" onClick={toggleOpen} aria-label="Notifications">
                Bell
                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            </button>
            {open && (
                <div className="notification-dropdown">
                    <div className="notification-header">
                        <span>Notifications</span>
                        {unreadCount > 0 && <button className="mark-read-btn" onClick={markAllRead}>Mark all read</button>}
                    </div>
                    {notifications.length === 0 ? (
                        <div className="notification-empty">No notifications yet</div>
                    ) : (
                        <ul className="notification-list">
                            {notifications.map(n => (
                                <li key={n.id} className={n.is_read ? 'read' : 'unread'}>
                                    <div className="notif-message">{n.message}</div>
                                    <div className="notif-meta">
                                        <span>{new Date(n.created_at).toLocaleString()}</span>
                                        {n.matched_tags.length > 0 && (
                                            <span className="notif-tags">{n.matched_tags.join(', ')}</span>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
