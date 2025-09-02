import { useState, useEffect } from "react";
import { DataAdapter } from "../utils/dataAdapter";

export const useMockData = () => {
  const [realtimeTransactions, setRealtimeTransactions] = useState<any[]>([]);
  const [fraudAlerts, setFraudAlerts] = useState<any[]>([]);
  const [creditProfiles, setCreditProfiles] = useState<any[]>([]);
  const [systemStats, setSystemStats] = useState({
    totalTransactions: 2847293,
    fraudDetected: 1247,
    fraudPrevented: 98.2,
    riskScore: 23,
    activeUsers: 156789,
    systemUptime: 99.9,
  });

  useEffect(() => {
    // Initialize data using sophisticated Ghanaian fraud dataset
    const initialAlerts = DataAdapter.generateRealtimeFraudAlerts(8);
    setFraudAlerts(initialAlerts);

    const initialProfiles = DataAdapter.generateCreditProfiles(15);
    setCreditProfiles(initialProfiles);

    // Initialize system stats from dataset patterns
    const initialStats = DataAdapter.getSystemMetrics();
    setSystemStats(initialStats);

    // Real-time updates using realistic fraud patterns
    const interval = setInterval(() => {
      // Add new transaction from dataset
      const newTransactions = DataAdapter.generateTransactionStream(1);
      if (newTransactions.length > 0) {
        setRealtimeTransactions((prev) => [newTransactions[0], ...prev.slice(0, 19)]);
      }

      // Occasionally add new alert based on fraud patterns
      if (Math.random() > 0.7) {
        const newAlerts = DataAdapter.generateRealtimeFraudAlerts(1);
        if (newAlerts.length > 0) {
          setFraudAlerts((prev) => [newAlerts[0], ...prev.slice(0, 7)]);
        }
      }

      // Update system stats with realistic patterns
      const updatedStats = DataAdapter.getSystemMetrics();
      setSystemStats((prev) => ({
        ...prev,
        totalTransactions: updatedStats.totalTransactions,
        fraudDetected: updatedStats.fraudDetected,
        riskScore: updatedStats.riskScore,
        activeUsers: updatedStats.activeUsers,
      }));
    }, 8000); // Slightly slower for more realistic feel

    return () => clearInterval(interval);
  }, []);

  const generateNewCreditProfile = () => {
    const newProfiles = DataAdapter.generateCreditProfiles(1);
    const newProfile = newProfiles[0];
    setCreditProfiles((prev) => [newProfile, ...prev]);
    return newProfile;
  };

  const updateCreditProfile = (id: string, updates: any) => {
    setCreditProfiles((prev) =>
      prev.map((profile) =>
        profile.id === id ? { ...profile, ...updates } : profile
      )
    );
  };

  const deleteCreditProfile = (id: string) => {
    setCreditProfiles((prev) => prev.filter((profile) => profile.id !== id));
  };

  return {
    realtimeTransactions,
    fraudAlerts,
    creditProfiles,
    systemStats,
    generateNewCreditProfile,
    updateCreditProfile,
    deleteCreditProfile,
  };
};
