import type { RefObject } from 'react';
import { QuotePreview } from '../quote-calculator';
import { SocialPreview } from '../SocialPreview';

export interface DocumentCanvasProps {
  stageRef: RefObject<HTMLDivElement | null>;
  isToolMode: boolean;
  docType: string;
  data: any;
  zoom: number;
  paperClass: string;
  TplComponent: any;
  brand: any;
  ActiveSocial: any;
  socialActiveData: any;
  bulkProgressIndex: number;
  bulkQueue: any[];
  paper: string;
}

export function DocumentCanvas({
  stageRef,
  isToolMode,
  docType,
  data,
  zoom,
  paperClass,
  TplComponent,
  brand,
  ActiveSocial,
  socialActiveData,
  bulkProgressIndex,
  bulkQueue,
  paper,
}: DocumentCanvasProps) {
  return (
    <>
      <div className="preview__stage" ref={stageRef}>
        {isToolMode ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
              paddingTop: 40,
              width: '100%',
              height: '100%',
            }}
          >
            <QuotePreview data={data} />
          </div>
        ) : docType !== 'social' ? (
          <div className="paper-wrap" style={{ transform: `scale(${zoom})` }}>
            <div id="paper-target" className={paperClass}>
              {TplComponent && <TplComponent data={data} brand={brand} />}
            </div>
          </div>
        ) : (
          <SocialPreview
            template={ActiveSocial}
            data={socialActiveData || {}}
            brand={brand}
            zoom={zoom}
          />
        )}
      </div>

      <div
        id="bulk-render-target-container"
        style={{
          position: 'fixed',
          left: '-9999px',
          top: '-9999px',
          width: paper === 'a4' ? '210mm' : '8.5in',
          height: paper === 'a4' ? '297mm' : '11in',
          overflow: 'hidden',
          pointerEvents: 'none',
          zIndex: -999,
        }}
      >
        {bulkProgressIndex >= 0 &&
          bulkProgressIndex < bulkQueue.length &&
          TplComponent && (
            <div
              id="bulk-paper-target"
              className={paperClass}
              style={{ transform: 'none', boxShadow: 'none' }}
            >
              <TplComponent data={bulkQueue[bulkProgressIndex].data} brand={brand} />
            </div>
          )}
      </div>
    </>
  );
}
