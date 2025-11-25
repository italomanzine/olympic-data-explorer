declare module 'react-simple-maps' {
  import * as React from 'react';

  export interface ComposableMapProps {
    width?: number;
    height?: number;
    projection?: string | Function;
    projectionConfig?: any;
    className?: string;
    style?: React.CSSProperties;
    children?: React.ReactNode;
  }

  export const ComposableMap: React.FC<ComposableMapProps>;

  export interface ZoomableGroupProps {
    center?: [number, number];
    zoom?: number;
    minZoom?: number;
    maxZoom?: number;
    translateExtent?: [[number, number], [number, number]];
    children?: React.ReactNode;
  }

  export const ZoomableGroup: React.FC<ZoomableGroupProps>;

  export interface GeographiesProps {
    geography?: string | Record<string, any> | string[];
    children: (args: { geographies: any[], projection: any, path: any }) => React.ReactNode;
  }

  export const Geographies: React.FC<GeographiesProps>;

  export interface GeographyProps {
    geography: any;
    key?: string | number;
    fill?: string;
    stroke?: string;
    strokeWidth?: number | string;
    style?: {
      default?: React.CSSProperties;
      hover?: React.CSSProperties;
      pressed?: React.CSSProperties;
    };
    onMouseEnter?: (event: React.MouseEvent) => void;
    onMouseLeave?: (event: React.MouseEvent) => void;
    onClick?: (event: React.MouseEvent) => void;
    title?: string;
  }

  export const Geography: React.FC<GeographyProps>;

  export const Marker: React.FC<any>;
}

