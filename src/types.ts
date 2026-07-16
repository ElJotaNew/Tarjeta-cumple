/**
 * Type definitions for the Jhonatan's 18th Birthday Invitation App.
 */

export interface RSVP {
  name: string;
  attending: boolean;
  guestsCount: number;
  dietary?: string;
  message?: string;
  timestamp: string;
}

export interface GuestComment {
  id: string;
  name: string;
  message: string;
  timestamp: string;
}

export interface ItineraryItem {
  time: string;
  title: string;
  description: string;
  icon: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface GeolocationState {
  status: 'idle' | 'locating' | 'success' | 'error';
  distance: number | null; // in km
  bearing: number | null; // in degrees from North
  errorMsg?: string;
}
