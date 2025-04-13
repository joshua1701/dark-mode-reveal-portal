
import React from 'react';
import { Button } from '@/components/ui/button';
import { Smartphone, Laptop, Monitor, ZoomIn, ZoomOut } from 'lucide-react';

type ViewportToolbarProps = {
  viewport: 'mobile' | 'tablet' | 'desktop';
  setViewport: (viewport: 'mobile' | 'tablet' | 'desktop') => void;
  zoom: number;
  setZoom: (value: number | ((prev: number) => number)) => void;
  hasPreviewUrl: boolean;
};

const ViewportToolbar: React.FC<ViewportToolbarProps> = ({
  viewport,
  setViewport,
  zoom,
  setZoom,
  hasPreviewUrl
}) => {
  return (
    <div className="bg-black/60 border-b border-white/10 p-3 flex items-center justify-between">
      {hasPreviewUrl ? (
        <>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 ${viewport === 'mobile' ? 'bg-white/10' : ''}`}
              onClick={() => setViewport('mobile')}
              title="Mobile View"
            >
              <Smartphone className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 ${viewport === 'tablet' ? 'bg-white/10' : ''}`}
              onClick={() => setViewport('tablet')}
              title="Tablet View"
            >
              <Laptop className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 ${viewport === 'desktop' ? 'bg-white/10' : ''}`}
              onClick={() => setViewport('desktop')}
              title="Desktop View"
            >
              <Monitor className="h-4 w-4" />
            </Button>
          </div>
        </>
      ) : (
        <div />
      )}
      
      <div className="flex items-center space-x-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setZoom(prev => Math.max(0.5, prev - 0.1))}
          title="Zoom Out"
          disabled={zoom <= 0.5}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <span className="text-sm font-mono px-2">
          {Math.round(zoom * 100)}%
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setZoom(prev => Math.min(2, prev + 0.1))}
          title="Zoom In"
          disabled={zoom >= 2}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs h-8 ml-2"
          onClick={() => setZoom(1)}
          disabled={zoom === 1}
        >
          Reset
        </Button>
      </div>
    </div>
  );
};

export default ViewportToolbar;
