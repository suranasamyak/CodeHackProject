import React, { useState } from 'react';
import { Bell, Check, ExternalLink } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { formatDateTime } from '../../lib/formatters';

export const NotificationCenter: React.FC = () => {
  const { notifications, markNotificationAsRead } = useData();
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-teal-600 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white p-4 shadow-xl border border-slate-200 z-50 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-900 text-sm">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="bg-teal-50 text-teal-700 text-xs px-2 py-0.5 rounded-full font-medium">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <button
                onClick={() => notifications.forEach((n) => markNotificationAsRead(n.id))}
                className="text-xs text-teal-600 hover:text-teal-700 font-medium"
              >
                Mark all read
              </button>
            </div>

            <div className="mt-2 divide-y divide-slate-100 max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No notifications yet.</p>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`py-3 px-1 transition-colors ${
                      notif.isRead ? 'opacity-70' : 'bg-teal-50/30 rounded-lg'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-semibold text-slate-800">{notif.title}</h4>
                      {!notif.isRead && (
                        <button
                          onClick={() => markNotificationAsRead(notif.id)}
                          className="text-slate-400 hover:text-teal-600"
                          title="Mark read"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{notif.message}</p>
                    <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400">
                      <span>{formatDateTime(notif.createdAt)}</span>
                      {notif.link && (
                        <a
                          href={notif.link}
                          onClick={() => setIsOpen(false)}
                          className="inline-flex items-center gap-1 text-teal-600 hover:underline font-medium"
                        >
                          View <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
