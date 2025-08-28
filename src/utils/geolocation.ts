// Real-time geolocation and IP-based location detection
export interface LocationData {
  latitude?: number;
  longitude?: number;
  city?: string;
  country?: string;
  region?: string;
  timezone?: string;
  isp?: string;
  accuracy?: number;
  source: 'gps' | 'ip' | 'cache' | 'unknown';
}

export interface LocationRisk {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskScore: number;
  factors: string[];
  isVPN: boolean;
  isTor: boolean;
  isProxy: boolean;
  isKnownLocation: boolean;
  distanceFromLastLocation?: number;
}

class GeolocationService {
  private lastKnownLocation: LocationData | null = null;
  private locationCache = new Map<string, LocationData>();
  private watchId: number | null = null;
  private callbacks: ((location: LocationData) => void)[] = [];

  async getCurrentLocation(): Promise<LocationData> {
    try {
      // Try GPS first
      const gpsLocation = await this.getGPSLocation();
      if (gpsLocation) {
        this.lastKnownLocation = gpsLocation;
        this.notifyCallbacks(gpsLocation);
        return gpsLocation;
      }
    } catch (error) {
      console.log('GPS not available, falling back to IP location');
    }

    // Fallback to IP-based location
    return this.getIPLocation();
  }

  private async getGPSLocation(): Promise<LocationData | null> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          
          // Reverse geocode to get city/country
          const locationDetails = await this.reverseGeocode(latitude, longitude);
          
          const location: LocationData = {
            latitude,
            longitude,
            accuracy,
            city: locationDetails.city,
            country: locationDetails.country,
            region: locationDetails.region,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            source: 'gps'
          };

          resolve(location);
        },
        (error) => {
          console.error('GPS location error:', error);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  private async getIPLocation(): Promise<LocationData> {
    try {
      // Simulate IP-based location detection
      // In a real app, you'd call an IP geolocation service
      const mockIPLocations = [
        {
          city: 'Accra',
          country: 'Ghana',
          region: 'Greater Accra',
          latitude: 5.6037,
          longitude: -0.1870,
          timezone: 'Africa/Accra',
          isp: 'MTN Ghana'
        },
        {
          city: 'Lagos',
          country: 'Nigeria', 
          region: 'Lagos State',
          latitude: 6.5244,
          longitude: 3.3792,
          timezone: 'Africa/Lagos',
          isp: 'Airtel Nigeria'
        },
        {
          city: 'Nairobi',
          country: 'Kenya',
          region: 'Nairobi County',
          latitude: -1.2921,
          longitude: 36.8219,
          timezone: 'Africa/Nairobi',
          isp: 'Safaricom'
        },
        {
          city: 'Cape Town',
          country: 'South Africa',
          region: 'Western Cape',
          latitude: -33.9249,
          longitude: 18.4241,
          timezone: 'Africa/Johannesburg',
          isp: 'Vodacom'
        }
      ];

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const location = mockIPLocations[Math.floor(Math.random() * mockIPLocations.length)];
      
      const locationData: LocationData = {
        ...location,
        source: 'ip'
      };

      this.lastKnownLocation = locationData;
      this.notifyCallbacks(locationData);
      return locationData;
    } catch (error) {
      console.error('IP location error:', error);
      return {
        city: 'Unknown',
        country: 'Unknown',
        source: 'unknown'
      };
    }
  }

  private async reverseGeocode(lat: number, lng: number): Promise<{city?: string, country?: string, region?: string}> {
    try {
      // Simulate reverse geocoding
      // In a real app, you'd use a service like Google Maps or OpenStreetMap
      const africanCities = [
        { city: 'Accra', country: 'Ghana', region: 'Greater Accra' },
        { city: 'Lagos', country: 'Nigeria', region: 'Lagos State' },
        { city: 'Nairobi', country: 'Kenya', region: 'Nairobi County' },
        { city: 'Cape Town', country: 'South Africa', region: 'Western Cape' },
        { city: 'Kumasi', country: 'Ghana', region: 'Ashanti' },
        { city: 'Abuja', country: 'Nigeria', region: 'FCT' }
      ];

      await new Promise(resolve => setTimeout(resolve, 500));
      return africanCities[Math.floor(Math.random() * africanCities.length)];
    } catch (error) {
      return { city: 'Unknown', country: 'Unknown', region: 'Unknown' };
    }
  }

  analyzeLocationRisk(currentLocation: LocationData, userProfile?: any): LocationRisk {
    const factors: string[] = [];
    let riskScore = 0;

    // Check if location is known
    const isKnownLocation = this.isLocationKnown(currentLocation);
    if (!isKnownLocation) {
      factors.push('New location detected');
      riskScore += 30;
    }

    // Check distance from last known location
    let distanceFromLastLocation = 0;
    if (this.lastKnownLocation && currentLocation.latitude && currentLocation.longitude) {
      distanceFromLastLocation = this.calculateDistance(
        this.lastKnownLocation.latitude!,
        this.lastKnownLocation.longitude!,
        currentLocation.latitude,
        currentLocation.longitude
      );

      if (distanceFromLastLocation > 1000) { // More than 1000km
        factors.push(`Large distance change: ${Math.round(distanceFromLastLocation)}km`);
        riskScore += 40;
      } else if (distanceFromLastLocation > 100) { // More than 100km
        factors.push(`Moderate distance change: ${Math.round(distanceFromLastLocation)}km`);
        riskScore += 20;
      }
    }

    // Simulate VPN/Proxy detection
    const isVPN = Math.random() < 0.1; // 10% chance
    const isProxy = Math.random() < 0.05; // 5% chance
    const isTor = Math.random() < 0.02; // 2% chance

    if (isVPN) {
      factors.push('VPN detected');
      riskScore += 25;
    }
    if (isProxy) {
      factors.push('Proxy server detected');
      riskScore += 35;
    }
    if (isTor) {
      factors.push('Tor network detected');
      riskScore += 50;
    }

    // Check for high-risk countries/regions (simulate)
    const highRiskRegions = ['Unknown', 'Tor Exit Node'];
    if (highRiskRegions.includes(currentLocation.region || '')) {
      factors.push('High-risk region');
      riskScore += 30;
    }

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' | 'critical';
    if (riskScore >= 80) riskLevel = 'critical';
    else if (riskScore >= 50) riskLevel = 'high';
    else if (riskScore >= 25) riskLevel = 'medium';
    else riskLevel = 'low';

    return {
      riskLevel,
      riskScore: Math.min(riskScore, 100),
      factors,
      isVPN,
      isTor,
      isProxy,
      isKnownLocation,
      distanceFromLastLocation
    };
  }

  private isLocationKnown(location: LocationData): boolean {
    // Simulate checking against known locations
    const knownCities = ['Accra', 'Lagos', 'Nairobi', 'Cape Town', 'Kumasi'];
    return knownCities.includes(location.city || '');
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI/180);
  }

  startWatching(): void {
    if (navigator.geolocation && !this.watchId) {
      this.watchId = navigator.geolocation.watchPosition(
        async (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          const locationDetails = await this.reverseGeocode(latitude, longitude);
          
          const location: LocationData = {
            latitude,
            longitude,
            accuracy,
            city: locationDetails.city,
            country: locationDetails.country,
            region: locationDetails.region,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            source: 'gps'
          };

          this.lastKnownLocation = location;
          this.notifyCallbacks(location);
        },
        (error) => console.error('Watch position error:', error),
        {
          enableHighAccuracy: false,
          timeout: 30000,
          maximumAge: 600000 // 10 minutes
        }
      );
    }
  }

  stopWatching(): void {
    if (this.watchId) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  onLocationUpdate(callback: (location: LocationData) => void): () => void {
    this.callbacks.push(callback);
    return () => {
      this.callbacks = this.callbacks.filter(cb => cb !== callback);
    };
  }

  private notifyCallbacks(location: LocationData): void {
    this.callbacks.forEach(callback => callback(location));
  }

  getLastKnownLocation(): LocationData | null {
    return this.lastKnownLocation;
  }
}

export const geolocationService = new GeolocationService();