import React, { useRef } from 'react';
import '@webcomponents/custom-elements'
import { useIsExtension } from '../utils';
import { Link, useLocation } from 'react-router-dom';

type MeshViewerProps = {
  className?: string;
  url?: string;
  image?: string;
  style?: React.CSSProperties;
  onError?: () => void;
};

export function MeshViewer(props: MeshViewerProps) {
  const isExtension = useIsExtension()
  const location = useLocation();
  
  if (isExtension) {
    return <a target="_blank" href={`https://wum.bo/${location.pathname}`}>
      <img className={`${props.className}`} src={props.image} />
    </a>
  }

  require('@google/model-viewer/dist/model-viewer');

  return (
    // @ts-ignore
    <model-viewer
      style={{ width: `100%`, height: `100%`, minHeight: 400, minWidth: 400, maxHeight: 400, ...props.style }}
      src={props.url}
      auto-rotate
      rotation-per-second="40deg"
      className={props.className}
      camera-controls
    />
  )
}
