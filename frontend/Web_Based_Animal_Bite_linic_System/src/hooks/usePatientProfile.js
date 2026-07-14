import { useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api/axios';

/**
 * Custom hook to fetch and manage patient profile data.
 * Provides profile completion status and utility functions.
 * Backend now returns flattened profile with fields:
 * id, first_name, last_name, email, contact_number, address,
 * date_of_birth, sex, emergency_contact_name, emergency_contact_phone,
 * emergency_contact_relation, blood_type, profile_completed
 */
export function usePatientProfile(enabled = true) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState('');

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await authAPI.getPatientProfile();
      setProfile(response.data);
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to load profile.';
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (data) => {
    setLoading(true);
    setError('');
    try {
      const response = await authAPI.updatePatientProfile(data);
      setProfile(response.data);
      return { success: true, data: response.data };
    } catch (err) {
      const responseData = err.response?.data;
      if (responseData) {
        const messages = Object.entries(responseData)
          .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
          .join('\n');
        setError(messages);
        return { success: false, error: messages };
      }
      setError('Failed to update profile.');
      return { success: false, error: 'Failed to update profile.' };
    } finally {
      setLoading(false);
    }
  }, []);

  const isProfileComplete = useCallback(() => {
    if (!profile) return false;
    return profile.profile_completed === true;
  }, [profile]);

  // Extract commonly needed profile fields for form pre-filling
  const getProfileFields = useCallback(() => {
    if (!profile) return {};
    return {
      first_name: profile.first_name || '',
      last_name: profile.last_name || '',
      email: profile.email || '',
      contact_number: profile.contact_number || '',
      address: profile.address || '',
      sex: profile.sex || '',
      date_of_birth: profile.date_of_birth || '',
      emergency_contact_name: profile.emergency_contact_name || '',
      emergency_contact_phone: profile.emergency_contact_phone || '',
      emergency_contact_relation: profile.emergency_contact_relation || '',
      blood_type: profile.blood_type || '',
    };
  }, [profile]);

  useEffect(() => {
    if (enabled) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [fetchProfile, enabled]);

  return {
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile,
    isProfileComplete,
    getProfileFields,
  };
}

export default usePatientProfile;
