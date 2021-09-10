import React, { useCallback, useEffect, useState } from 'react';
import { ITokenWithMeta } from "../utils/metaplex";
import { MeshViewer } from "./MeshViewer";
import { IMetadataExtension, MetadataFile } from "@oyster/common"
import { Stream, StreamPlayerApi } from '@cloudflare/stream-react';

const MeshArtContent = ({
  uri,
  image,
  animationUrl,
  className,
  style,
  files,
}: {
  uri?: string;
  image?: string;
  animationUrl?: string;
  className?: string;
  style?: React.CSSProperties;
  files?: (MetadataFile | string)[];
}) => {
  const renderURL =
    files && files.length > 0 && typeof files[0] === 'string'
      ? files[0]
      : animationUrl;

  return <MeshViewer image={image} url={renderURL} className={className} style={style} />;
};

const VideoArtContent = ({
  className,
  style,
  files,
  uri,
  animationURL,
  active,
}: {
  className?: string;
  style?: React.CSSProperties;
  files?: (MetadataFile | string)[];
  uri?: string;
  animationURL?: string;
  active?: boolean;
}) => {
  const [playerApi, setPlayerApi] = useState<StreamPlayerApi>();

  const playerRef = useCallback(
    ref => {
      setPlayerApi(ref);
    },
    [setPlayerApi],
  );

  useEffect(() => {
    if (playerApi) {
      playerApi.currentTime = 0;
    }
  }, [active, playerApi]);

  const likelyVideo = (files || []).filter((f, index, arr) => {
    if (typeof f !== 'string') {
      return false;
    }

    // TODO: filter by fileType
    return arr.length >= 2 ? index === 1 : index === 0;
  })?.[0] as string;

  const content =
    likelyVideo &&
    likelyVideo.startsWith('https://watch.videodelivery.net/') ? (
      <div className={`${className} square`}>
        <Stream
          streamRef={(e: any) => playerRef(e)}
          src={likelyVideo.replace('https://watch.videodelivery.net/', '')}
          loop={true}
          height={600}
          width={600}
          controls={false}
          videoDimensions={{
            videoHeight: 700,
            videoWidth: 400,
          }}
          autoplay={true}
          muted={true}
        />
      </div>
    ) : (
      <video
        className={className}
        playsInline={true}
        autoPlay={true}
        muted={true}
        controls={true}
        controlsList="nodownload"
        style={style}
        loop={true}
        poster={uri}
      >
        {likelyVideo && (
          <source src={likelyVideo} type="video/mp4" style={style} />
        )}
        {animationURL && (
          <source src={animationURL} type="video/mp4" style={style} />
        )}
        {files
          ?.filter(f => typeof f !== 'string')
          .map((f: any) => (
            <source key={f.uri} src={f.uri} type={f.type} style={style} />
          ))}
      </video>
    );

  return content;
};


function getLast<T>(arr: T[]) {
  if (arr.length <= 0) {
    return undefined;
  }

  return arr[arr.length - 1];
};

export const Nft: React.FC<{ data: IMetadataExtension, className?: string, meshEnabled?: boolean, style?: React.CSSProperties }> = ({
  data,
  className,
  style,
  meshEnabled = true
}) => {
  const animationURL = data?.animation_url || '';
  const animationUrlExt = new URLSearchParams(
    getLast(animationURL.split('?')),
  ).get('ext');

  const category = data?.properties.category;
  const uri = data?.image

  if (
    meshEnabled &&
    (category === 'vr' ||
      animationUrlExt === 'glb' ||
      animationUrlExt === 'gltf')
  ) {
    return (
      <MeshArtContent
        image={data?.image}
        style={style}
        className={className}
        uri={uri}
        animationUrl={animationURL}
        files={data?.properties.files}
      />
    );
  }

  if (category === "video") {
    return <VideoArtContent
      className={className}
      files={data?.properties.files}
      uri={uri}
      animationURL={animationURL}
      active={true}
    />
  }

  return <img className={`${className}`} src={data?.image} alt={data?.name} />
}