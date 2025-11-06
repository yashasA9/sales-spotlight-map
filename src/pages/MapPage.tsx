import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Search, Navigation } from "lucide-react";
import { toast } from "sonner";

// Declare google as a global variable
declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

const MapPage = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Sample supermarket locations (you can expand this list)
  const supermarkets = [
    { name: "FreshMart Downtown", lat: 40.7580, lng: -73.9855 },
    { name: "GreenGrocer Plaza", lat: 40.7489, lng: -73.9680 },
    { name: "SuperSave Market", lat: 40.7614, lng: -73.9776 },
    { name: "Urban Harvest", lat: 40.7549, lng: -73.9840 },
    { name: "City Fresh Store", lat: 40.7505, lng: -73.9934 },
  ];

  useEffect(() => {
    const API_KEY = "YOUR_GOOGLE_MAPS_API_KEY"; // Replace with your actual API key
    
    if (API_KEY === "YOUR_GOOGLE_MAPS_API_KEY") {
      toast.error("Please add your Google Maps API key in MapPage.tsx");
      setIsLoading(false);
      return;
    }

    const loadGoogleMapsScript = () => {
      // Check if script is already loaded
      if (window.google && window.google.maps) {
        initMap();
        return;
      }

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => initMap();
      script.onerror = () => {
        toast.error("Failed to load Google Maps. Please check your API key.");
        setIsLoading(false);
      };
      document.head.appendChild(script);
    };

    const initMap = () => {
      if (!mapRef.current) return;

      try {
        const mapInstance = new window.google.maps.Map(mapRef.current, {
          center: { lat: 40.7580, lng: -73.9855 }, // Default to NYC
          zoom: 13,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }],
            },
          ],
        });

        setMap(mapInstance);

        // Add markers for supermarkets
        supermarkets.forEach((store) => {
          new window.google.maps.Marker({
            position: { lat: store.lat, lng: store.lng },
            map: mapInstance,
            title: store.name,
            icon: {
              url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
                <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="16" cy="16" r="12" fill="#16a34a" stroke="white" stroke-width="2"/>
                  <path d="M16 10 L16 22 M10 16 L22 16" stroke="white" stroke-width="2"/>
                </svg>
              `),
              scaledSize: new window.google.maps.Size(32, 32),
            },
          });
        });

        setIsLoading(false);
      } catch (error) {
        console.error("Error initializing map:", error);
        setIsLoading(false);
        toast.error("Failed to initialize map");
      }
    };

    loadGoogleMapsScript();
  }, []);

  const handleSearch = () => {
    if (!map || !searchQuery || !window.google) return;

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: searchQuery }, (results: any, status: string) => {
      if (status === "OK" && results?.[0]) {
        map.setCenter(results[0].geometry.location);
        map.setZoom(14);
        toast.success(`Found: ${searchQuery}`);
      } else {
        toast.error("Location not found");
      }
    });
  };

  const handleLocateMe = () => {
    if (!map || !window.google) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          map.setCenter(pos);
          map.setZoom(14);
          
          new window.google.maps.Marker({
            position: pos,
            map: map,
            title: "Your Location",
            icon: {
              url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
                <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="16" cy="16" r="8" fill="#ea580c" stroke="white" stroke-width="2"/>
                </svg>
              `),
              scaledSize: new window.google.maps.Size(32, 32),
            },
          });
          
          toast.success("Location found!");
        },
        () => {
          toast.error("Unable to get your location");
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 animate-fade-in">
          <h1 className="mb-2 text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Find Nearby Stores
          </h1>
          <p className="text-muted-foreground">
            Locate supermarkets near you or search for specific locations
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3 animate-fade-in">
          <div className="space-y-4 lg:col-span-1">
            <Card className="p-4">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                  <Button onClick={handleSearch} size="icon">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
                <Button onClick={handleLocateMe} className="w-full" variant="outline">
                  <Navigation className="mr-2 h-4 w-4" />
                  Use My Location
                </Button>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="mb-3 font-semibold flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Nearby Stores
              </h3>
              <div className="space-y-2">
                {supermarkets.map((store, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      if (map) {
                        map.setCenter({ lat: store.lat, lng: store.lng });
                        map.setZoom(15);
                      }
                    }}
                    className="w-full rounded-lg border p-3 text-left transition-colors hover:bg-muted"
                  >
                    <p className="font-medium">{store.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Click to view on map
                    </p>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          <Card className="lg:col-span-2 overflow-hidden">
            {isLoading ? (
              <div className="flex h-[600px] items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  <p className="text-muted-foreground">Loading map...</p>
                </div>
              </div>
            ) : (
              <div ref={mapRef} className="h-[600px] w-full" />
            )}
          </Card>
        </div>

        <Card className="mt-6 p-4 bg-muted/50">
          <h3 className="mb-2 font-semibold">Setup Instructions:</h3>
          <ol className="space-y-1 text-sm text-muted-foreground list-decimal list-inside">
            <li>Get a Google Maps API key from <a href="https://developers.google.com/maps" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Cloud Console</a></li>
            <li>Enable Maps JavaScript API in your Google Cloud project</li>
            <li>Replace "YOUR_GOOGLE_MAPS_API_KEY" in src/pages/MapPage.tsx with your actual API key</li>
            <li>Reload the page to see the interactive map</li>
          </ol>
        </Card>
      </div>
    </div>
  );
};

export default MapPage;
