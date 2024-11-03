import { useRouteError } from "react-router";

interface errorMsg {
  status?: number;
  statusText?: string;
  message?: string;
}

export default function Error() {
  const error: errorMsg = useRouteError() as errorMsg;
  console.log(error);
  return (
    <div>
      <h1>Oops A Error Happened</h1>
      <p>
        <b>Error : </b>
        {error.statusText || error.message}
      </p>
    </div>
  );
}
