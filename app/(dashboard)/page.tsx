import { redirect } from "next/navigation";

/** The app home is the products page. */
export default function HomePage() {
  redirect("/products");
}
