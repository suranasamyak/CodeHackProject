import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  Resource,
  EquipmentRequest,
  Booking,
  ConditionReport,
  Incident,
  MaintenanceRecord,
  AppNotification,
  AuditLog,
  BookingStatus,
} from '../types';
import {
  DEMO_RESOURCES,
  DEMO_EQUIPMENT_REQUESTS,
  DEMO_BOOKINGS,
  DEMO_INCIDENTS,
  DEMO_MAINTENANCE,
} from '../data/seedData';
import { useAuth } from './AuthContext';
import { generateId } from '../lib/utils';

interface DataContextType {
  resources: Resource[];
  equipmentRequests: EquipmentRequest[];
  bookings: Booking[];
  conditionReports: ConditionReport[];
  incidents: Incident[];
  maintenanceRecords: MaintenanceRecord[];
  notifications: AppNotification[];
  auditLogs: AuditLog[];
  loading: boolean;
  // Resource operations
  createResource: (res: Omit<Resource, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateResource: (id: string, updates: Partial<Resource>) => Promise<void>;
  deleteResource: (id: string) => Promise<void>;
  // Request operations
  createEquipmentRequest: (req: Omit<EquipmentRequest, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateEquipmentRequest: (id: string, updates: Partial<EquipmentRequest>) => Promise<void>;
  // Booking operations
  createBooking: (b: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateBookingStatus: (id: string, status: BookingStatus, reason?: string) => Promise<void>;
  checkOutBooking: (bookingId: string, condition: string, notes: string) => Promise<void>;
  returnBooking: (bookingId: string, condition: string, notes: string, discrepancies?: string) => Promise<void>;
  // Incident & Maintenance
  createIncident: (inc: Omit<Incident, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateIncident: (id: string, updates: Partial<Incident>) => Promise<void>;
  createMaintenanceRecord: (m: Omit<MaintenanceRecord, 'id' | 'createdAt'>) => Promise<string>;
  updateMaintenanceRecord: (id: string, updates: Partial<MaintenanceRecord>) => Promise<void>;
  // Notifications & Audit
  markNotificationAsRead: (id: string) => void;
  resetToDemoData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();

  // Local storage hydrated states with seed defaults
  const [resources, setResources] = useState<Resource[]>(() => {
    const cached = localStorage.getItem('rl_resources');
    return cached ? JSON.parse(cached) : DEMO_RESOURCES;
  });

  const [equipmentRequests, setEquipmentRequests] = useState<EquipmentRequest[]>(() => {
    const cached = localStorage.getItem('rl_requests');
    return cached ? JSON.parse(cached) : DEMO_EQUIPMENT_REQUESTS;
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    const cached = localStorage.getItem('rl_bookings');
    return cached ? JSON.parse(cached) : DEMO_BOOKINGS;
  });

  const [conditionReports, setConditionReports] = useState<ConditionReport[]>(() => {
    const cached = localStorage.getItem('rl_condition_reports');
    return cached ? JSON.parse(cached) : [];
  });

  const [incidents, setIncidents] = useState<Incident[]>(() => {
    const cached = localStorage.getItem('rl_incidents');
    return cached ? JSON.parse(cached) : DEMO_INCIDENTS;
  });

  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>(() => {
    const cached = localStorage.getItem('rl_maintenance');
    return cached ? JSON.parse(cached) : DEMO_MAINTENANCE;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'notif_welcome',
      userId: currentUser?.id || 'all',
      title: 'Welcome to ResourceLoop',
      message: 'Explore over 20 campus research instruments or submit a SmartFind request for missing items.',
      type: 'system',
      isRead: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'notif_match_ready',
      userId: 'user_student_rohit',
      title: 'SmartFind Match Identified',
      message: 'FLIR E4 Compact Thermal Camera matched your capstone project request at COEP.',
      type: 'match',
      link: '/smartfind',
      isRead: false,
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
  ]);

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    {
      id: 'audit_init',
      actorId: 'system',
      actorName: 'ResourceLoop System',
      action: 'BOOTSTRAP',
      entityType: 'System',
      entityId: 'rl_core',
      details: 'ResourceLoop consortium node initialized with 3 academic institutions.',
      timestamp: new Date().toISOString(),
    },
  ]);

  const [loading, setLoading] = useState<boolean>(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('rl_resources', JSON.stringify(resources));
  }, [resources]);

  useEffect(() => {
    localStorage.setItem('rl_requests', JSON.stringify(equipmentRequests));
  }, [equipmentRequests]);

  useEffect(() => {
    localStorage.setItem('rl_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('rl_condition_reports', JSON.stringify(conditionReports));
  }, [conditionReports]);

  useEffect(() => {
    localStorage.setItem('rl_incidents', JSON.stringify(incidents));
  }, [incidents]);

  useEffect(() => {
    localStorage.setItem('rl_maintenance', JSON.stringify(maintenanceRecords));
  }, [maintenanceRecords]);

  // Firestore real-time listeners (with error boundary so app never crashes if offline)
  useEffect(() => {
    const unsubResources = onSnapshot(
      collection(db, 'resources'),
      (snapshot) => {
        if (!snapshot.empty) {
          const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Resource));
          setResources(docs);
        }
      },
      (err) => console.warn('Firestore resources listener inactive (using cached/demo data):', err.message)
    );

    const unsubRequests = onSnapshot(
      collection(db, 'equipmentRequests'),
      (snapshot) => {
        if (!snapshot.empty) {
          const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as EquipmentRequest));
          setEquipmentRequests(docs);
        }
      },
      (err) => console.warn('Firestore requests listener inactive:', err.message)
    );

    const unsubBookings = onSnapshot(
      collection(db, 'bookings'),
      (snapshot) => {
        if (!snapshot.empty) {
          const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Booking));
          setBookings(docs);
        }
      },
      (err) => console.warn('Firestore bookings listener inactive:', err.message)
    );

    return () => {
      unsubResources();
      unsubRequests();
      unsubBookings();
    };
  }, []);

  const logAudit = async (
    action: string,
    entityType: string,
    entityId: string,
    previousStatus?: string,
    newStatus?: string,
    details?: string
  ) => {
    const newLog: AuditLog = {
      id: generateId('audit'),
      actorId: currentUser?.id || 'system',
      actorName: currentUser?.displayName || 'User',
      action,
      entityType,
      entityId,
      previousStatus,
      newStatus,
      details,
      timestamp: new Date().toISOString(),
    };

    setAuditLogs((prev) => [newLog, ...prev]);

    try {
      await setDoc(doc(db, 'auditLogs', newLog.id), newLog);
    } catch {
      // Local log remains preserved
    }
  };

  const createResource = async (resData: Omit<Resource, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    const id = generateId('res');
    const now = new Date().toISOString();
    const newResource: Resource = {
      ...resData,
      id,
      createdAt: now,
      updatedAt: now,
    };

    setResources((prev) => [newResource, ...prev]);
    await logAudit('CREATE_RESOURCE', 'Resource', id, undefined, newResource.availability, `Created ${newResource.name}`);

    try {
      await setDoc(doc(db, 'resources', id), newResource);
    } catch (e) {
      console.warn('Firestore setDoc failed, kept in local state:', e);
    }
    return id;
  };

  const updateResource = async (id: string, updates: Partial<Resource>): Promise<void> => {
    const now = new Date().toISOString();
    setResources((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates, updatedAt: now } : r))
    );
    await logAudit('UPDATE_RESOURCE', 'Resource', id, undefined, updates.availability, 'Updated specifications or status');

    try {
      await setDoc(doc(db, 'resources', id), { ...updates, updatedAt: now }, { merge: true });
    } catch (e) {
      console.warn('Firestore updateDoc failed:', e);
    }
  };

  const deleteResource = async (id: string): Promise<void> => {
    setResources((prev) => prev.filter((r) => r.id !== id));
    await logAudit('DELETE_RESOURCE', 'Resource', id, undefined, 'deleted');
    try {
      await deleteDoc(doc(db, 'resources', id));
    } catch (e) {
      console.warn('Firestore delete failed:', e);
    }
  };

  const createEquipmentRequest = async (
    reqData: Omit<EquipmentRequest, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> => {
    const id = generateId('req');
    const now = new Date().toISOString();
    const newRequest: EquipmentRequest = {
      ...reqData,
      id,
      createdAt: now,
      updatedAt: now,
    };

    // Auto-check for matching resources in the current catalog
    const matched = resources.find(
      (r) =>
        r.category === newRequest.category &&
        (r.name.toLowerCase().includes(newRequest.equipmentName.toLowerCase().split(' ')[0]) ||
          newRequest.equipmentName.toLowerCase().includes(r.name.toLowerCase().split(' ')[0]))
    );

    if (matched) {
      newRequest.status = 'potential_match';
      newRequest.matchedResourceId = matched.id;
      newRequest.matchedResourceName = matched.name;
    }

    setEquipmentRequests((prev) => [newRequest, ...prev]);
    await logAudit('CREATE_REQUEST', 'EquipmentRequest', id, undefined, newRequest.status, `Submitted demand for ${newRequest.equipmentName}`);

    try {
      await setDoc(doc(db, 'equipmentRequests', id), newRequest);
    } catch (e) {
      console.warn('Firestore save failed:', e);
    }
    return id;
  };

  const updateEquipmentRequest = async (id: string, updates: Partial<EquipmentRequest>): Promise<void> => {
    const now = new Date().toISOString();
    setEquipmentRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates, updatedAt: now } : r))
    );
    await logAudit('UPDATE_REQUEST', 'EquipmentRequest', id, undefined, updates.status);
    try {
      await setDoc(doc(db, 'equipmentRequests', id), { ...updates, updatedAt: now }, { merge: true });
    } catch (e) {
      console.warn('Firestore update failed:', e);
    }
  };

  const createBooking = async (bData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    const id = generateId('book');
    const now = new Date().toISOString();
    const newBooking: Booking = {
      ...bData,
      id,
      createdAt: now,
      updatedAt: now,
    };

    setBookings((prev) => [newBooking, ...prev]);

    // Add in-app notification for the resource owner
    const newNotif: AppNotification = {
      id: generateId('notif'),
      userId: bData.ownerId,
      title: 'New Booking Request',
      message: `${bData.requesterName} requested to book "${bData.resourceName}" (${bData.startDate} to ${bData.endDate}).`,
      type: 'booking',
      link: '/bookings',
      isRead: false,
      createdAt: now,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    await logAudit('BOOKING_REQUESTED', 'Booking', id, undefined, 'pending', `Requested by ${bData.requesterName}`);

    try {
      await setDoc(doc(db, 'bookings', id), newBooking);
      await setDoc(doc(db, 'notifications', newNotif.id), newNotif);
    } catch (e) {
      console.warn('Firestore booking create failed:', e);
    }
    return id;
  };

  const updateBookingStatus = async (id: string, status: BookingStatus, reason?: string): Promise<void> => {
    const booking = bookings.find((b) => b.id === id);
    const prevStatus = booking?.status;
    const now = new Date().toISOString();

    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status, rejectionReason: reason, updatedAt: now } : b))
    );

    // If approved, update resource availability to booked if active now
    if (status === 'approved' && booking) {
      updateResource(booking.resourceId, { availability: 'booked' });
    } else if (status === 'cancelled' || status === 'rejected' || status === 'completed') {
      if (booking) {
        updateResource(booking.resourceId, { availability: 'available' });
      }
    }

    if (booking) {
      const notif: AppNotification = {
        id: generateId('notif'),
        userId: booking.requesterId,
        title: `Booking ${status.toUpperCase()}`,
        message: `Your booking for "${booking.resourceName}" was updated to ${status}.${reason ? ` Reason: ${reason}` : ''}`,
        type: 'approval',
        link: '/bookings',
        isRead: false,
        createdAt: now,
      };
      setNotifications((prev) => [notif, ...prev]);
    }

    await logAudit('BOOKING_STATUS_CHANGE', 'Booking', id, prevStatus, status, reason);

    try {
      await setDoc(doc(db, 'bookings', id), { status, rejectionReason: reason, updatedAt: now }, { merge: true });
    } catch (e) {
      console.warn('Firestore update booking failed:', e);
    }
  };

  const checkOutBooking = async (bookingId: string, condition: string, notes: string): Promise<void> => {
    const now = new Date().toISOString();
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    const reportId = generateId('report_out');
    const report: ConditionReport = {
      id: reportId,
      bookingId,
      resourceId: booking.resourceId,
      resourceName: booking.resourceName,
      submittedBy: currentUser?.id || booking.requesterId,
      submitterName: currentUser?.displayName || booking.requesterName,
      reportType: 'check_out',
      overallCondition: condition as any,
      notes,
      accessoriesConfirmed: true,
      createdAt: now,
    };

    setConditionReports((prev) => [report, ...prev]);
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              status: 'checked_out',
              checkOutAt: now,
              initialCondition: `${condition}: ${notes}`,
              updatedAt: now,
            }
          : b
      )
    );

    updateResource(booking.resourceId, { availability: 'booked' });
    await logAudit('CHECK_OUT', 'Booking', bookingId, booking.status, 'checked_out', `Checked out with condition: ${condition}`);

    try {
      await setDoc(doc(db, 'conditionReports', reportId), report);
      await setDoc(
        doc(db, 'bookings', bookingId),
        { status: 'checked_out', checkOutAt: now, initialCondition: `${condition}: ${notes}`, updatedAt: now },
        { merge: true }
      );
    } catch (e) {
      console.warn('Firestore checkout write failed:', e);
    }
  };

  const returnBooking = async (
    bookingId: string,
    condition: string,
    notes: string,
    discrepancies?: string
  ): Promise<void> => {
    const now = new Date().toISOString();
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    const reportId = generateId('report_ret');
    const report: ConditionReport = {
      id: reportId,
      bookingId,
      resourceId: booking.resourceId,
      resourceName: booking.resourceName,
      submittedBy: currentUser?.id || booking.requesterId,
      submitterName: currentUser?.displayName || booking.requesterName,
      reportType: 'return',
      overallCondition: condition as any,
      notes,
      accessoriesConfirmed: !discrepancies,
      discrepancies,
      createdAt: now,
    };

    setConditionReports((prev) => [report, ...prev]);

    const finalStatus: BookingStatus = discrepancies || condition === 'damaged' ? 'returned_pending_inspection' : 'completed';

    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              status: finalStatus,
              returnedAt: now,
              returnCondition: `${condition}: ${notes}${discrepancies ? ` [Discrepancies: ${discrepancies}]` : ''}`,
              updatedAt: now,
            }
          : b
      )
    );

    // Make resource available again unless damaged
    updateResource(booking.resourceId, {
      availability: condition === 'damaged' ? 'maintenance' : 'available',
      condition: condition as any,
    });

    await logAudit('RETURN_EQUIPMENT', 'Booking', bookingId, 'checked_out', finalStatus, `Returned in ${condition} state.`);

    try {
      await setDoc(doc(db, 'conditionReports', reportId), report);
      await setDoc(
        doc(db, 'bookings', bookingId),
        { status: finalStatus, returnedAt: now, returnCondition: report.notes, updatedAt: now },
        { merge: true }
      );
    } catch (e) {
      console.warn('Firestore return write failed:', e);
    }
  };

  const createIncident = async (incData: Omit<Incident, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    const id = generateId('inc');
    const now = new Date().toISOString();
    const newIncident: Incident = {
      ...incData,
      id,
      createdAt: now,
      updatedAt: now,
    };

    setIncidents((prev) => [newIncident, ...prev]);
    await logAudit('REPORT_INCIDENT', 'Incident', id, undefined, newIncident.reviewStatus, `Reported ${newIncident.incidentType} on ${newIncident.resourceName}`);

    try {
      await setDoc(doc(db, 'incidents', id), newIncident);
    } catch (e) {
      console.warn('Firestore incident write failed:', e);
    }
    return id;
  };

  const updateIncident = async (id: string, updates: Partial<Incident>): Promise<void> => {
    const now = new Date().toISOString();
    setIncidents((prev) =>
      prev.map((inc) => (inc.id === id ? { ...inc, ...updates, updatedAt: now } : inc))
    );
    await logAudit('UPDATE_INCIDENT', 'Incident', id, undefined, updates.reviewStatus, updates.resolution);
    try {
      await setDoc(doc(db, 'incidents', id), { ...updates, updatedAt: now }, { merge: true });
    } catch (e) {
      console.warn('Firestore incident update failed:', e);
    }
  };

  const createMaintenanceRecord = async (mData: Omit<MaintenanceRecord, 'id' | 'createdAt'>): Promise<string> => {
    const id = generateId('maint');
    const now = new Date().toISOString();
    const newRecord: MaintenanceRecord = {
      ...mData,
      id,
      createdAt: now,
    };

    setMaintenanceRecords((prev) => [newRecord, ...prev]);

    // Mark the resource under maintenance
    updateResource(mData.resourceId, {
      availability: 'maintenance',
      maintenanceStatus: 'in_repair',
    });

    await logAudit('CREATE_MAINTENANCE', 'MaintenanceRecord', id, undefined, mData.status, mData.issueDescription);

    try {
      await setDoc(doc(db, 'maintenanceRecords', id), newRecord);
    } catch (e) {
      console.warn('Firestore maint write failed:', e);
    }
    return id;
  };

  const updateMaintenanceRecord = async (id: string, updates: Partial<MaintenanceRecord>): Promise<void> => {
    setMaintenanceRecords((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );

    const record = maintenanceRecords.find((m) => m.id === id);
    if (updates.status === 'completed' && record) {
      updateResource(record.resourceId, {
        availability: 'available',
        maintenanceStatus: 'operational',
      });
    }

    await logAudit('UPDATE_MAINTENANCE', 'MaintenanceRecord', id, undefined, updates.status);

    try {
      await setDoc(doc(db, 'maintenanceRecords', id), updates, { merge: true });
    } catch (e) {
      console.warn('Firestore maint update failed:', e);
    }
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const resetToDemoData = async () => {
    setResources(DEMO_RESOURCES);
    setEquipmentRequests(DEMO_EQUIPMENT_REQUESTS);
    setBookings(DEMO_BOOKINGS);
    setIncidents(DEMO_INCIDENTS);
    setMaintenanceRecords(DEMO_MAINTENANCE);
    localStorage.removeItem('rl_resources');
    localStorage.removeItem('rl_requests');
    localStorage.removeItem('rl_bookings');
    localStorage.removeItem('rl_incidents');
    localStorage.removeItem('rl_maintenance');
    await logAudit('RESET_DEMO_DATA', 'System', 'demo_reset', undefined, 'completed', 'Hydrated standard 20-item hackathon dataset');
  };

  return (
    <DataContext.Provider
      value={{
        resources,
        equipmentRequests,
        bookings,
        conditionReports,
        incidents,
        maintenanceRecords,
        notifications,
        auditLogs,
        loading,
        createResource,
        updateResource,
        deleteResource,
        createEquipmentRequest,
        updateEquipmentRequest,
        createBooking,
        updateBookingStatus,
        checkOutBooking,
        returnBooking,
        createIncident,
        updateIncident,
        createMaintenanceRecord,
        updateMaintenanceRecord,
        markNotificationAsRead,
        resetToDemoData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
