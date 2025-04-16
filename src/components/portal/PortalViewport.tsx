
import React from 'react';

type PortalViewportProps = { 
  url: string, 
  viewport: 'mobile' | 'tablet' | 'desktop',
  zoom: number
};

const PortalViewport: React.FC<PortalViewportProps> = ({ url, viewport, zoom }) => {
  const getViewportStyle = () => {
    switch (viewport) {
      case 'mobile':
        return { width: `${320 * zoom}px`, height: `${568 * zoom}px` };
      case 'tablet':
        return { width: `${768 * zoom}px`, height: `${1024 * zoom}px` };
      case 'desktop':
      default:
        return { width: '100%', height: '100%' };
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center overflow-auto bg-black/20 rounded-lg relative">
      <iframe 
        src={url} 
        style={getViewportStyle()}
        className="border-0 transition-all duration-300 ease-in-out"
        title="Project Preview"
      />
      <div className="absolute bottom-4 right-4 text-xs text-white/30">
        Powered by CogswellShare
      </div>
    </div>
  );
};

export default PortalViewport;
