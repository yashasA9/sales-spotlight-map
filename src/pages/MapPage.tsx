import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Navigation as NavigationIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import L from "leaflet";

interface Supermarket {
  name: string;
  lat: number;
  lng: number;
  address: string;
}

const supermarkets: Supermarket[] = [
  { name: "SuperMart Central", lat: 16.8661, lng: 96.1951, address: "Downtown Yangon, Myanmar" },
  { name: "FreshChoice Market", lat: 16.82, lng: 96.135, address: "Insein Township, Yangon" },
  { name: "MegaSave Supermarket", lat: 19.745, lng: 96.1297, address: "Mandalay City Center" },
  { name: "City Grocers", lat: 16.84, lng: 96.17, address: "Hlaing Township, Yangon" },
  { name: "Quick Stop Market", lat: 21.9588, lng: 96.0891, address: "Naypyidaw Business District" },
];

const StoreLocator = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<L.Map | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!mapRef.current) return;

    const initialMap = L.map(mapRef.current).setView([16.8661, 96.1951], 12);
    setMap(initialMap);

    // Add OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
    }).addTo(initialMap);

    // Add store markers
    supermarkets.forEach((store) => {
      const marker = L.marker([store.lat, store.lng]).addTo(initialMap);
      marker.bindPopup(`<b>${store.name}</b><br>${store.address}`);
    });

    return () => {
      initialMap.remove();
    };
  }, []);

  const locateUser = () => {
    if (!map) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const userMarker = L.marker([latitude, longitude], {
            icon: L.divIcon({
              html: '<div style="background:#2563eb;width:14px;height:14px;border-radius:50%;border:2px solid white;"></div>',
              className: "",
            }),
          }).addTo(map);
          map.setView([latitude, longitude], 14);
          toast({
            title: "Location Found",
            description: "Showing nearby supermarkets",
          });
        },
        () => {
          toast({
            title: "Location Error",
            description: "Unable to access your location. Please enable location services.",
            variant: "destructive",
          });
        }
      );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Store Locator
          </h1>
          <p className="text-muted-foreground">Find supermarkets near you</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Store List */}
          <div className="space-y-4">
            <Card className="p-4">
              <Button onClick={locateUser} className="w-full" variant="outline">
                <NavigationIcon className="h-4 w-4 mr-2" />
                Use My Location
              </Button>
            </Card>

            {supermarkets.map((store, index) => (
              <Card
                key={index}
                className="p-4 hover:shadow-card-hover transition-smooth cursor-pointer"
                onClick={() => map?.setView([store.lat, store.lng], 15)}
              >
                <div className="flex items-start space-x-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{store.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{store.address}</p>
                  </div> 
                </div>
              </Card>
            ))}
          </div>

          {/* Map */}
          <Card className="lg:col-span-2 p-0 overflow-hidden">
            <div ref={mapRef} className="w-full h-[600px] rounded-lg" />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StoreLocator;
