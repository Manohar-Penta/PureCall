import { useEffect, useRef } from "react";

export default function VideoCall({
  LS,
  RS,
}: {
  LS: MediaStream | null;
  RS: MediaStream | null;
}) {
  const localVid = useRef<HTMLVideoElement>(null);
  const remoteVid = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (localVid.current == null || remoteVid.current == null) return;
    localVid.current.srcObject = LS;
    remoteVid.current.srcObject = RS;
  }, [LS, RS]);

  return (
    <>
      <div className="flex w-full justify-around p-4 flex-col md:flex-row sm:max-h-full">
        {
          <div className={`relative m-2 ` + (RS == null ? "hidden" : "")}>
            <p className="absolute text-white font-semibold max-md:text-lg left-2 top-2">
              Other Video :
            </p>
            <video
              id="received_video"
              autoPlay
              ref={remoteVid}
              width={600}
              height={300}
              className="rounded border border-white"
            >
              Your browser doesn't support Video calling
            </video>
          </div>
        }

        {
          <div className={"relative m-2" + (LS == null ? " hidden" : "")}>
            <p className="absolute text-white font-semibold max-md:text-lg left-2 top-2">
              My Video :
            </p>
            <video
              id="local_video"
              autoPlay
              muted
              ref={localVid}
              width={600}
              height={300}
              className="rounded border border-white"
            >
              Your browser doesn't support Video calling
            </video>
          </div>
        }
      </div>
    </>
  );
}
