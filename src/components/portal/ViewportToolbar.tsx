
import React from 'react';
import { Button } from '@/components/ui/button';
import { Monitor, Smartphone, Tablet, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

type ViewportToolbarProps = {
  viewport: 'mobile' | 'tablet' | 'desktop';
  setViewport: (viewport: 'mobile' | 'tablet' | 'desktop') => void;
  zoom: number;
  setZoom: (zoom: number) => void;
  hasPreviewUrl: boolean;
  language?: 'en' | 'de';
};

// Translation content
const translations = {
  en: {
    zoomIn: 'Zoom In',
    zoomOut: 'Zoom Out',
    resetZoom: 'Reset Zoom',
    mobileView: 'Mobile View',
    tabletView: 'Tablet View',
    desktopView: 'Desktop View'
  },
  de: {
    zoomIn: 'Vergrößern',
    zoomOut: 'Verkleinern',
    resetZoom: 'Zoom zurücksetzen',
    mobileView: 'Mobile Ansicht',
    tabletView: 'Tablet Ansicht',
    desktopView: 'Desktop Ansicht'
  }
};

const ViewportToolbar: React.FC<ViewportToolbarProps> = ({
  viewport,
  setViewport,
  zoom,
  setZoom,
  hasPreviewUrl,
  language = 'en'
}) => {
  const t = translations[language];
  
  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 0.1, 2));
  };
  
  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 0.1, 0.5));
  };
  
  const handleResetZoom = () => {
    setZoom(1);
  };
  
  return (
    <div className="bg-black/50 border-b border-white/10 p-3 flex flex-wrap justify-between gap-2">
      <div className="flex space-x-1">
        {hasPreviewUrl && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewport('mobile')}
              className={`border-white/10 ${viewport === 'mobile' ? 'bg-white/10' : 'hover:bg-white/5'}`}
              title={t.mobileView}
            >
              <Smartphone className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewport('tablet')}
              className={`border-white/10 ${viewport === 'tablet' ? 'bg-white/10' : 'hover:bg-white/5'}`}
              title={t.tabletView}
            >
              <Tablet className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewport('desktop')}
              className={`border-white/10 ${viewport === 'desktop' ? 'bg-white/10' : 'hover:bg-white/5'}`}
              title={t.desktopView}
            >
              <Monitor className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
      
      <div className="flex space-x-1">
        <Button
          variant="outline"
          size="sm"
          onClick={handleZoomOut}
          className="border-white/10 hover:bg-white/5"
          title={t.zoomOut}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <div className="bg-white/5 text-xs h-8 flex items-center px-2 rounded border border-white/10">
          {Math.round(zoom * 100)}%
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleZoomIn}
          className="border-white/10 hover:bg-white/5"
          title={t.zoomIn}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleResetZoom}
          className="border-white/10 hover:bg-white/5"
          title={t.resetZoom}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ViewportToolbar;
