// Type definitions for Google Maps JavaScript API
// This is simplified and not complete, but addresses the most common use cases in our application

declare global {
  interface Window {
    google: typeof google;
  }
}

declare namespace google.maps {
  class Map {
    constructor(mapDiv: Element, opts?: MapOptions);
    setCenter(latLng: LatLng | LatLngLiteral): void;
    setZoom(zoom: number): void;
    panTo(latLng: LatLng | LatLngLiteral): void;
    fitBounds(bounds: LatLngBounds | LatLngBoundsLiteral): void;
    getCenter(): LatLng;
    getZoom(): number;
    addListener(eventName: string, handler: Function): MapsEventListener;
    getDiv(): Element;
    getProjection(): Projection;
  }

  interface MapOptions {
    center?: LatLng | LatLngLiteral;
    zoom?: number;
    mapTypeId?: string;
    disableDefaultUI?: boolean;
    draggable?: boolean;
    scrollwheel?: boolean;
    disableDoubleClickZoom?: boolean;
    mapTypeControl?: boolean;
    streetViewControl?: boolean;
    fullscreenControl?: boolean;
    zoomControl?: boolean;
    styles?: Array<any>;
  }

  class LatLng {
    constructor(lat: number, lng: number, noWrap?: boolean);
    lat(): number;
    lng(): number;
    equals(other: LatLng): boolean;
    toString(): string;
    toUrlValue(precision?: number): string;
  }

  interface LatLngLiteral {
    lat: number;
    lng: number;
  }

  class LatLngBounds {
    constructor(sw?: LatLng | LatLngLiteral, ne?: LatLng | LatLngLiteral);
    extend(point: LatLng | LatLngLiteral): LatLngBounds;
    getCenter(): LatLng;
    isEmpty(): boolean;
    equals(other: LatLngBounds | LatLngBoundsLiteral): boolean;
    contains(latLng: LatLng | LatLngLiteral): boolean;
    toString(): string;
    toUrlValue(precision?: number): string;
  }

  interface LatLngBoundsLiteral {
    east: number;
    north: number;
    south: number;
    west: number;
  }

  class Marker {
    constructor(opts?: MarkerOptions);
    setMap(map: Map | null): void;
    getMap(): Map | null;
    setPosition(latLng: LatLng | LatLngLiteral): void;
    getPosition(): LatLng;
    setTitle(title: string): void;
    getTitle(): string;
    setIcon(icon: string | Icon | Symbol): void;
    setAnimation(animation: any): void;
    setVisible(visible: boolean): void;
    addListener(eventName: string, handler: Function): MapsEventListener;
  }

  interface MarkerOptions {
    position: LatLng | LatLngLiteral;
    map?: Map;
    title?: string;
    icon?: string | Icon | Symbol;
    label?: string | MarkerLabel;
    draggable?: boolean;
    visible?: boolean;
    animation?: any;
    zIndex?: number;
  }

  interface MarkerLabel {
    color: string;
    text: string;
    fontWeight?: string;
    fontSize?: string;
    fontFamily?: string;
  }

  interface Icon {
    url: string;
    size?: Size;
    origin?: Point;
    anchor?: Point;
    scaledSize?: Size;
  }

  class Size {
    constructor(width: number, height: number, widthUnit?: string, heightUnit?: string);
    equals(other: Size): boolean;
    width: number;
    height: number;
  }

  class Point {
    constructor(x: number, y: number);
    equals(other: Point): boolean;
    x: number;
    y: number;
  }

  class Symbol {
    constructor(options: {
      path: SymbolPath | string;
      fillColor?: string;
      fillOpacity?: number;
      scale?: number;
      strokeColor?: string;
      strokeOpacity?: number;
      strokeWeight?: number;
    });
  }

  enum SymbolPath {
    BACKWARD_CLOSED_ARROW,
    BACKWARD_OPEN_ARROW,
    CIRCLE,
    FORWARD_CLOSED_ARROW,
    FORWARD_OPEN_ARROW
  }

  interface MapsEventListener {
    remove(): void;
  }

  interface MapMouseEvent {
    latLng?: LatLng;
  }

  class Geocoder {
    constructor();
    geocode(request: GeocoderRequest, callback: (results: GeocoderResult[], status: GeocoderStatus) => void): void;
  }

  interface GeocoderRequest {
    address?: string;
    location?: LatLng | LatLngLiteral;
    bounds?: LatLngBounds | LatLngBoundsLiteral;
    componentRestrictions?: GeocoderComponentRestrictions;
    region?: string;
  }

  interface GeocoderComponentRestrictions {
    administrativeArea?: string;
    country?: string | string[];
    locality?: string;
    postalCode?: string;
    route?: string;
  }

  interface GeocoderResult {
    address_components: {
      long_name: string;
      short_name: string;
      types: string[];
    }[];
    formatted_address: string;
    geometry: {
      location: LatLng;
      location_type: string;
      viewport: LatLngBounds;
      bounds?: LatLngBounds;
    };
    place_id: string;
    plus_code?: {
      compound_code: string;
      global_code: string;
    };
    types: string[];
  }

  type GeocoderStatus = 'ERROR' | 'INVALID_REQUEST' | 'OK' | 'OVER_QUERY_LIMIT' | 'REQUEST_DENIED' | 'UNKNOWN_ERROR' | 'ZERO_RESULTS';

  class DirectionsService {
    constructor();
    route(request: DirectionsRequest, callback: (result: DirectionsResult | null, status: DirectionsStatus) => void): void;
  }

  interface DirectionsRequest {
    origin: string | LatLng | LatLngLiteral | Place;
    destination: string | LatLng | LatLngLiteral | Place;
    travelMode: TravelMode;
    transitOptions?: TransitOptions;
    drivingOptions?: DrivingOptions;
    unitSystem?: UnitSystem;
    waypoints?: DirectionsWaypoint[];
    optimizeWaypoints?: boolean;
    provideRouteAlternatives?: boolean;
    avoidFerries?: boolean;
    avoidHighways?: boolean;
    avoidTolls?: boolean;
    region?: string;
  }

  interface Place {
    location: LatLng | LatLngLiteral;
    placeId: string;
    query: string;
  }

  interface TransitOptions {
    arrivalTime?: Date;
    departureTime?: Date;
    modes?: TransitMode[];
    routingPreference?: TransitRoutePreference;
  }

  type TransitMode = 'BUS' | 'RAIL' | 'SUBWAY' | 'TRAIN' | 'TRAM';
  type TransitRoutePreference = 'FEWER_TRANSFERS' | 'LESS_WALKING';

  interface DrivingOptions {
    departureTime: Date;
    trafficModel?: TrafficModel;
  }

  type TrafficModel = 'BEST_GUESS' | 'OPTIMISTIC' | 'PESSIMISTIC';
  type UnitSystem = 'IMPERIAL' | 'METRIC';

  interface DirectionsWaypoint {
    location: string | LatLng | LatLngLiteral | Place;
    stopover?: boolean;
  }

  interface DirectionsResult {
    routes: DirectionsRoute[];
  }

  interface DirectionsRoute {
    bounds: LatLngBounds;
    copyrights: string;
    legs: DirectionsLeg[];
    overview_path: LatLng[];
    overview_polyline: { points: string };
    warnings: string[];
    waypoint_order: number[];
  }

  interface DirectionsLeg {
    arrival_time?: Time;
    departure_time?: Time;
    distance: Distance;
    duration: Duration;
    duration_in_traffic?: Duration;
    end_address: string;
    end_location: LatLng;
    start_address: string;
    start_location: LatLng;
    steps: DirectionsStep[];
    via_waypoints: LatLng[];
  }

  interface Time {
    text: string;
    time_zone: string;
    value: Date;
  }

  interface Distance {
    text: string;
    value: number;
  }

  interface Duration {
    text: string;
    value: number;
  }

  interface DirectionsStep {
    distance: Distance;
    duration: Duration;
    end_location: LatLng;
    instructions: string;
    path: LatLng[];
    start_location: LatLng;
    transit?: TransitDetails;
    travel_mode: TravelMode;
  }

  interface TransitDetails {
    arrival_stop: TransitStop;
    arrival_time: Time;
    departure_stop: TransitStop;
    departure_time: Time;
    headsign: string;
    headway: number;
    line: TransitLine;
    num_stops: number;
  }

  interface TransitStop {
    location: LatLng;
    name: string;
  }

  interface TransitLine {
    agencies: TransitAgency[];
    color: string;
    icon: string;
    name: string;
    short_name: string;
    text_color: string;
    url: string;
    vehicle: TransitVehicle;
  }

  interface TransitAgency {
    name: string;
    phone: string;
    url: string;
  }

  interface TransitVehicle {
    icon: string;
    local_icon: string;
    name: string;
    type: VehicleType;
  }

  type VehicleType = 'BUS' | 'CABLE_CAR' | 'COMMUTER_TRAIN' | 'FERRY' | 'FUNICULAR' | 'GONDOLA_LIFT' | 'HEAVY_RAIL' | 'HIGH_SPEED_TRAIN' | 'INTERCITY_BUS' | 'METRO_RAIL' | 'MONORAIL' | 'OTHER' | 'RAIL' | 'SHARE_TAXI' | 'SUBWAY' | 'TRAM' | 'TROLLEYBUS';
  type TravelMode = 'BICYCLING' | 'DRIVING' | 'TRANSIT' | 'WALKING';
  type DirectionsStatus = 'INVALID_REQUEST' | 'MAX_WAYPOINTS_EXCEEDED' | 'NOT_FOUND' | 'OK' | 'OVER_QUERY_LIMIT' | 'REQUEST_DENIED' | 'UNKNOWN_ERROR' | 'ZERO_RESULTS';

  class DirectionsRenderer {
    constructor(opts?: DirectionsRendererOptions);
    setDirections(directions: DirectionsResult | null): void;
    getDirections(): DirectionsResult | null;
    setMap(map: Map | null): void;
    getMap(): Map | null;
    setPanel(panel: Element | null): void;
    getPanel(): Element | null;
    setOptions(options: DirectionsRendererOptions): void;
    setRouteIndex(routeIndex: number): void;
    getRouteIndex(): number;
  }

  interface DirectionsRendererOptions {
    directions?: DirectionsResult;
    map?: Map;
    panel?: Element;
    draggable?: boolean;
    hideRouteList?: boolean;
    markerOptions?: MarkerOptions;
    polylineOptions?: PolylineOptions;
    preserveViewport?: boolean;
    routeIndex?: number;
    suppressInfoWindows?: boolean;
    suppressMarkers?: boolean;
    suppressPolylines?: boolean;
  }

  interface PolylineOptions {
    clickable?: boolean;
    draggable?: boolean;
    editable?: boolean;
    geodesic?: boolean;
    icons?: IconSequence[];
    map?: Map;
    path?: LatLng[] | LatLngLiteral[] | MVCArray<LatLng> | MVCArray<LatLngLiteral>;
    strokeColor?: string;
    strokeOpacity?: number;
    strokeWeight?: number;
    visible?: boolean;
    zIndex?: number;
  }

  interface IconSequence {
    icon: Symbol;
    offset?: string;
    repeat?: string;
  }

  class MVCArray<T> {
    constructor(array?: T[]);
    clear(): void;
    forEach(callback: (elem: T, i: number) => void): void;
    getArray(): T[];
    getAt(i: number): T;
    getLength(): number;
    insertAt(i: number, elem: T): void;
    pop(): T;
    push(elem: T): number;
    removeAt(i: number): T;
    setAt(i: number, elem: T): void;
  }

  class Projection {
    fromLatLngToPoint(latLng: LatLng): Point;
    fromPointToLatLng(pixel: Point, noWrap?: boolean): LatLng;
  }
}

export {}; 