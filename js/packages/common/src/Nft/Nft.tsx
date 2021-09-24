import React, { useCallback, useEffect, useState } from "react";
import { Image, ImageProps } from "@chakra-ui/react";
import { MeshViewer } from "./MeshViewer";
import { IMetadataExtension, MetadataFile } from "@oyster/common";
import { Stream, StreamPlayerApi } from "@cloudflare/stream-react";
import { getImageFromMeta, useIsExtension } from "../utils";

const MeshArtContent = ({
  uri,
  animationUrl,
  style,
  files,
}: {
  uri?: string;
  animationUrl?: string;
  style?: React.CSSProperties;
  files?: (MetadataFile | string)[];
}) => {
  const renderURL =
    files && files.length > 0 && typeof files[0] === "string"
      ? files[0]
      : animationUrl;

  return <MeshViewer image={uri} url={renderURL} style={style} />;
};

const VideoArtContent = ({
  style,
  files,
  uri,
  animationURL,
  active,
  className
}: {
  style?: React.CSSProperties;
  files?: (MetadataFile | string)[];
  uri?: string;
  animationURL?: string;
  active?: boolean;
  className?: string;
}) => {
  const [playerApi, setPlayerApi] = useState<StreamPlayerApi>();

  const isExtension = useIsExtension();
  
  // Blocked by twitter content policy
  if (isExtension && window.location.href.includes("twitter")) {
    return (
      <a target="_blank" href={`https://wum.bo/${location.pathname}`}>
        <img className={`${className}`} src={uri} />
      </a>
    );
  }

  const playerRef = useCallback(
    (ref) => {
      setPlayerApi(ref);
    },
    [setPlayerApi]
  );

  useEffect(() => {
    if (playerApi) {
      playerApi.currentTime = 0;
    }
  }, [active, playerApi]);

  const likelyVideo = (files || []).filter((f, index, arr) => {
    if (typeof f !== "string") {
      return false;
    }

    // TODO: filter by fileType
    return arr.length >= 2 ? index === 1 : index === 0;
  })?.[0] as string;

  const content =
    likelyVideo &&
    likelyVideo.startsWith("https://watch.videodelivery.net/") ? (
      <Stream
        streamRef={(e: any) => playerRef(e)}
        src={likelyVideo.replace("https://watch.videodelivery.net/", "")}
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
    ) : (
      <video
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
          ?.filter((f) => typeof f !== "string")
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
}

export const Nft: React.FC<{
  image?: string;
  data: IMetadataExtension;
  meshEnabled?: boolean;
  videoEnabled?: boolean;
  style?: React.CSSProperties;
  imageProps?: ImageProps;
}> = ({ image, data, style, videoEnabled = true, meshEnabled = true, imageProps = {} }) => {
  const animationURL = data?.animation_url || "";
  const animationUrlExt = new URLSearchParams(
    getLast(animationURL.split("?"))
  ).get("ext");

  const category = data?.properties.category;
  const imageUri = image || getImageFromMeta(data);

  if (
    meshEnabled &&
    (category === "vr" ||
      animationUrlExt === "glb" ||
      animationUrlExt === "gltf")
  ) {
    return (
      <MeshArtContent
        style={style}
        uri={imageUri}
        animationUrl={animationURL}
        files={data?.properties.files}
      />
    );
  }

  if (videoEnabled && category === "video") {
    return (
      <VideoArtContent
        files={data?.properties.files}
        uri={imageUri}
        animationURL={animationURL}
        active={true}
      />
    );
  }

  return <Image src={imageUri} alt={data?.name} {...imageProps} />;
};
