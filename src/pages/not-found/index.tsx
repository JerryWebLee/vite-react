import { Helmet } from "react-helmet-async";
import { NoFound } from "./404";

export default function NotFound() {
  return (
    <>
      <Helmet>
        <title>404 | {import.meta.env.VITE_APP_TITLE_SUFFIX}</title>
      </Helmet>
      <NoFound />
    </>
  );
}
