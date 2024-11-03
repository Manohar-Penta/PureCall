import { useNavigate } from "react-router";
import { Button } from "./components/ui/button";
import { MdNoAccounts } from "react-icons/md";
import { MdCrueltyFree } from "react-icons/md";
import { MdOutlineVideoChat } from "react-icons/md";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="text-center">
      <div className="p-6 bg-blue-800 gap-14 flex flex-col justify-around items-center text-white">
        <div>
          <h1 className="text-9xl text-white font-bold">PureCall</h1>
          <p className="text-3xl text-gray-400">
            Effortless Anonymous Video Calls
          </p>
        </div>
        <div className="w-3/4">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            plugins={[
              Autoplay({
                delay: 2500,
              }),
            ]}
          >
            <CarouselContent>
              <CarouselItem>
                <p className="text-2xl p-4">
                  No signup needed!! make quick call to your friend without
                  evening droping your name.
                </p>
              </CarouselItem>
              <CarouselItem>
                <p className="text-2xl p-4">
                  Can't find the pricing?? because there is no pricing. WebRTC
                  enables direct connection between Users with no extra server
                  in between.
                </p>
              </CarouselItem>
              <CarouselItem>
                <p className="text-2xl p-4">
                  Low latency & High quality Video calls with your friends.
                </p>
              </CarouselItem>
            </CarouselContent>
            <CarouselPrevious className="text-gray-500" />
            <CarouselNext className="text-gray-500" />
          </Carousel>
        </div>
        <Button
          onClick={() => navigate("/videocall")}
          className="text-2xl p-8 bg-gray-500"
        >
          Call Them Now
        </Button>
      </div>
      <div className="text-black flex flex-col justify-around p-6">
        <h2 className="text-6xl p-6 font-semibold text-blue-800 mb-10">
          Why use PureCall??
        </h2>
        <div className="md:flex m-4 justify-evenly my-auto">
          <div className="border shadow-md p-6 w-1/5 rounded flex flex-col items-center gap-4">
            <MdNoAccounts size={"7rem"} />
            <h3 className="text-2xl font-semibold text-blue-800">No Signup</h3>
            <p>
              Get a ID from us, share it with the person you want to interact
            </p>
          </div>
          <div className="border shadow-md p-6 w-1/5 rounded flex flex-col items-center gap-4">
            <MdCrueltyFree size={"7rem"} />
            <h3 className="text-2xl font-semibold text-blue-800">
              Free for ever
            </h3>
            <p>Never pay for video calls again</p>
          </div>
          <div className="border shadow-md p-6 w-1/5 rounded flex flex-col items-center gap-4">
            <MdOutlineVideoChat size={"7rem"} />
            <h3 className="text-2xl font-semibold text-blue-800">
              Quality Interactions
            </h3>
            <p>Interact in High Quality & Low latency video calls</p>
          </div>
        </div>
      </div>
      <div className="bg-gray-200 text-black text-2xl p-6 m-6 gap-4 md:p-12">
        <h2 className="text-4xl font-semibold text-blue-800">
          How does PureCall Work??
        </h2>
        <br />
        <p className="leading-8 ">
          PureCall enables users to connect through video calls directly from
          their browsers using WebRTC technology. By leveraging WebRTC, PureCall
          provides real-time, high-quality video communication without the need
          for additional plugins or software installations. WebRTC establishes a
          peer-to-peer connections between users, resulting in lower latency and
          improved call quality.
        </p>
      </div>
      <div className="h-30 bg-blue-700 mt-4 text-4xl text-white p-6">
        Stay tunned for up coming features...
      </div>
    </div>
  );
}
